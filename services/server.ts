'use server';

import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { redirect } from 'next/navigation';

// external services
import { SignJWT, jwtVerify } from 'jose';
import { log } from '@/lib/logger';
import { DatabaseError } from 'pg';
import { getTranslations } from 'next-intl/server';

// auth
import {
  deleteSessionTokenCookie,
  invalidateSession,
  SessionValidationResult,
  validateSessionToken,
} from '@/lib/lucia/auth';

// helpers
import { FormState, fromErrorToFormState, toFormState } from '@/components/helpers/form-items';

// services
import { RATE_LIMITS } from '@/services/common';
import { schema_create_user_basic } from './validation';
import type {
  T_user_register_secret,
  T_user_register_form,
  EmailSchema,
  TelegramSchema,
} from './types';
import { DB_create_user } from './db';
import { revalidatePath } from 'next/cache';
import { deleteFile, getSignedUrlForDownload, getSignedUrlForUpload, listFiles } from '@/lib/r2';
import { sendEmail as sendEmailService } from '@/lib/email';
import { sendTelegram as sendTelegramService } from '@/lib/telegram';

/* Notes:
    createClient()
    - cant used in unstable_cache cus of cookies not in requset
    - need to create createClient in that function

    cannot have export const in "use server"

    remember to revalidate in necessary functions

    prefix: utils_, create_, get_, update_, delete_
*/

// #####################################################
//              COMMON ACTIONS
// #####################################################
export async function utils_encrypt(payload: any): Promise<string> {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('10 days from now')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));
  } catch (error) {
    await utils_log_server_error('Error encrypting', error);
    throw 'Error encrypting: ' + error;
  }
}

export async function utils_decrypt(input: string) {
  try {
    const { payload } = await jwtVerify(input, new TextEncoder().encode(process.env.JWT_SECRET), {
      algorithms: ['HS256'],
    });
    delete payload.iat;
    delete payload.exp;
    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw 'cookie compromised';
    }
    await utils_log_server_error('Error decrypting', error);
    throw 'Error decrypting: ' + error;
  }
}

export async function set_cookie<T>(
  cookieName: string,
  data: T extends Array<any> ? never : T,
  minutes: number
): Promise<void> {
  try {
    const value = await utils_encrypt(data);
    cookies().set(cookieName, value, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: minutes * 60,
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (error) {
    await utils_log_server_error(
      'Error setting cookie',
      error,
      undefined,
      `${cookieName} cookie: `
    );
    throw `Failed to set ${cookieName} cookie:` + error + '\n';
  }
}

export async function get_cookie(cookieName: string): Promise<{
  value: any;
  cookieToDelete: string | null;
}> {
  try {
    // find cookie
    const cookie = cookies().get(cookieName);
    if (!cookie) {
      return { value: null, cookieToDelete: null };
    }

    // decrypt cookie
    const value = await utils_decrypt(cookie.value);
    return { value, cookieToDelete: null };
  } catch (error: any) {
    if (error === 'cookie compromised') {
      try {
        await delete_cookie(cookieName);
        return { value: null, cookieToDelete: null };
      } catch (cookieName: any) {
        //   return cookie name to delete to delete from client using server action
        return { value: null, cookieToDelete: cookieName as string };
      }
    }
    await utils_log_server_error(
      'Error getting cookie',
      error,
      undefined,
      `${cookieName} cookie: `
    );
    throw `Failed to get ${cookieName} cookie:` + error + '\n';
  }
}

// server actions needs to be async
export async function delete_cookie(cookieName: string): Promise<void> {
  try {
    cookies().delete(cookieName);
  } catch (error: any) {
    await utils_log_server_error(
      'Error deleting cookie',
      error,
      undefined,
      `${cookieName} cookie: `
    );
    throw cookieName;
  }
}

export async function utils_log_server_error(
  fn: string,
  error: any,
  user_id?: string,
  message?: string
) {
  const ip = headers().get('x-forwarded-for') || 'unknown';

  if (error instanceof Error) {
    log.error('Server error', { fn, message: message + error.message, ip, user_id: user_id || '' });
  } else {
    log.error('Server error', { fn, message: message || '' + error, ip, user_id: user_id || '' });
  }
  await log.flush();
}

export async function utils_log_server_info(
  fn: string,
  message: string,
  metadata: Record<string, any> = {}
) {
  const ip = headers().get('x-forwarded-for') || 'unknown';
  log.info('Server info', { fn, message, ip, ...metadata });
  await log.flush();
}

export async function utils_log_db_error(fn: string, error: any, user_id?: string) {
  const ip = headers().get('x-forwarded-for') || 'unknown';

  if (error instanceof DatabaseError) {
    log.error('DB error', { fn, message: error.detail, ip, user_id: user_id || '' });
  } else if (error instanceof Error) {
    log.error('DB uncaught error', { fn, message: error.message, ip, user_id: user_id || '' });
  } else {
    log.error('DB unknown error', { fn, message: error, ip, user_id: user_id || '' });
  }
  await log.flush();
}

// #####################################################
//               RATE LIMIT
// #####################################################

const dataStore = new Map<string, any>();

// Store rate limits in Map

export async function get_rateLimit(
  feature: keyof typeof RATE_LIMITS
): Promise<{ exceeded: boolean }> {
  const ip = headers().get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const featureLimit = RATE_LIMITS[feature];

  const rateLimitKey = `rateLimit:${ip}:${feature}`;
  let userRateLimit = dataStore.get(rateLimitKey) || { count: 0, lastReset: now };

  // Reset count if outside the rate limit window
  if (now - userRateLimit.lastReset > featureLimit.window) {
    userRateLimit.count = 0;
    userRateLimit.lastReset = now;
  }

  // Check if rate limit exceeded
  if (userRateLimit.count >= featureLimit.limit) {
    log.warn(`Rate limit exceeded`, {
      message: `${featureLimit.label}`,
      ip,
    });
    await log.flush();
    return {
      exceeded: true,
    };
  }

  // Increment request count and store back
  userRateLimit.count++;
  dataStore.set(rateLimitKey, userRateLimit);

  return { exceeded: false };
}

/**
 * @example
 * ```ts
 * export default async function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
 *   const rateLimitFeature = (searchParams.rateLimit as keyof typeof RATE_LIMITS) || undefined;
 *
 *   return (
 *     <>
 *       {rateLimitFeature && <RateLimitExceeded feature={rateLimitFeature} />}
 *     </>
 *   );
 * }
 * ```
 * 
 * 
 * @example2  
 * ```ts
 * const isRateLimited = await get_rateLimit_toast("checkout", true);
    if (isRateLimited) {
    return tRateLimit("title", { feature: tRateLimit("features.checkout") }) + tRateLimit("tryAgainLater"),
    }
 * ```
 */
export async function get_rateLimit_toast(
  feature: keyof typeof RATE_LIMITS,
  returnError: boolean = false
): Promise<boolean> {
  const rateLimitStatus = await get_rateLimit(feature);
  const referer = headers().get('referer') || '/';

  if (rateLimitStatus.exceeded) {
    if (returnError) {
      return true;
    }
    redirect(referer.split('?')[0] + '?rateLimit=' + feature);
  } else {
    return false;
  }
}

// #####################################################
//               USER ACTIONS
// #####################################################

// use everywhere accept middleware
export const lucia_get_user = cache(async (): Promise<SessionValidationResult> => {
  try {
    const token = cookies().get('session')?.value ?? null;
    if (!token) {
      return {
        user: null,
        session: null,
      };
    }
    const result = await validateSessionToken(token);
    return {
      ...result,
      user: {
        ...result.user,
        role:
          process.env.NODE_ENV === 'development'
            ? process.env.DEV_ROLE || result.user?.role
            : result.user?.role, // to solve issue of devs using same account for multiple roles and cant work at the same time
      },
    } as SessionValidationResult;
  } catch (error) {
    await utils_log_server_error('lucia_get_user', error);
    throw 'lucia_get_user: ' + error;
  }
});

export async function lucia_logout(): Promise<void> {
  try {
    const { session } = await lucia_get_user();

    // must delete session cookie whenever pressed logout
    deleteSessionTokenCookie();

    if (!session) {
      return;
    }

    await invalidateSession(session.id);
  } catch (error) {
    await utils_log_server_error('lucia_logout', error);
    throw 'lucia_logout: ' + error;
  }
}

export async function create_user(user: T_user_register_form): Promise<FormState> {
  await get_rateLimit_toast('registerUser');

  try {
    const tAuth = await getTranslations('auth');

    const userCredentials = (await get_cookie('register_user')).value as T_user_register_secret;
    if (!userCredentials) {
      revalidatePath('/auth');
      throw new Error(tAuth('pls login again'));
    }

    let cleanUser: T_user_register_secret;

    const dirtyUser: T_user_register_secret = {
      provider: userCredentials.provider,
      provider_user_id: userCredentials.provider_user_id,
      access_token: userCredentials.access_token,
      refresh_token: userCredentials.refresh_token,
      name: user.name,
      phone: user.phone,
      photo: userCredentials.photo,
      email: userCredentials.email,
      role: userCredentials.role || user.role,
    };

    cleanUser = schema_create_user_basic.parse(dirtyUser);

    await DB_create_user(cleanUser);
    await delete_cookie('register_user');
    return toFormState('SUCCESS', 'User created');
  } catch (error) {
    await utils_log_server_error('create_user', error);
    return fromErrorToFormState(error);
  }
}

// #####################################################
//               R2 FILES
// #####################################################
export async function get_r2_files() {
  try {
    return await listFiles();
  } catch (error) {
    await utils_log_server_error('get_r2_files', error);
    throw 'get_r2_files: ' + error;
  }
}

export async function get_r2_upload_signed_url(key: string, fileType: string, fileSize: number) {
  const { user } = await lucia_get_user();
  try {
    if (!user) {
      throw 'Unauthorized';
    }

    const signedUrl = await getSignedUrlForUpload(key, fileType, fileSize);
    return { signedUrl, key };
  } catch (error) {
    await utils_log_server_error('get_r2_upload_signed_url', error);
    throw 'get_r2_upload_signed_url: ' + error;
  }
}

export async function get_r2_download_signed_url(key: string) {
  try {
    return await getSignedUrlForDownload(key);
  } catch (error) {
    await utils_log_server_error('get_r2_download_signed_url', error);
    throw 'get_r2_download_signed_url: ' + error;
  }
}

export async function delete_r2_file(key: string) {
  try {
    await deleteFile(key);
  } catch (error) {
    await utils_log_server_error('delete_r2_file', error);
    throw 'delete_r2_file: ' + error;
  }
}

// #####################################################
//               EMAIL & TELEGRAM
// #####################################################

export async function sendEmail(emailData: EmailSchema): Promise<void> {
  try {
    await utils_log_server_info('sendEmail', 'Attempting to send email', { to: emailData.to });
    await sendEmailService(emailData);
    await utils_log_server_info('sendEmail', 'Email sent successfully', {
      to: emailData.to,
    });
  } catch (error) {
    await utils_log_server_error('sendEmail', error);
    throw error;
  }
}

export async function sendTelegram(telegramData: TelegramSchema): Promise<void> {
  try {
    await utils_log_server_info('sendTelegram', 'Attempting to send telegram', {
      chatId: telegramData.chatId,
    });
    await sendTelegramService(telegramData);
    await utils_log_server_info('sendTelegram', 'Telegram sent successfully', {
      chatId: telegramData.chatId,
    });
  } catch (error) {
    await utils_log_server_error('sendTelegram', error);
    throw error;
  }
}
