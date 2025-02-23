import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// db
import { oauth_accounts } from '@/lib/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/drizzle';

// external
import {
  createSession,
  generateSessionToken,
  github,
  google,
  setSessionTokenCookie,
} from '@/lib/lucia/auth';
import { OAuth2RequestError, OAuth2Tokens } from 'arctic';

// services
import { set_cookie } from '@/services/server';
import { T_user_register_secret } from '@/services/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider?: string } }
): Promise<NextResponse> {
  const provider = params.provider;

  if (!provider) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies().get('oauth_state')?.value ?? null;
  const storedCodeVerifier = cookies().get('code_verifier')?.value ?? null;
  if (
    code === null ||
    storedState === null ||
    state !== storedState ||
    storedCodeVerifier === null
  ) {
    return NextResponse.redirect(String(process.env.NEXT_PUBLIC_APP_URL) + '/auth');
  }
  try {
    let tokens: OAuth2Tokens;
    let userResponseUrl: string;
    let emailResponseUrl: string | null = null;
    switch (provider) {
      case 'github':
        tokens = await github.validateAuthorizationCode(code);
        userResponseUrl = 'https://api.github.com/user';
        emailResponseUrl = 'https://api.github.com/user/emails';

        break;
      case 'google':
        tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
        userResponseUrl = 'https://openidconnect.googleapis.com/v1/userinfo';
        break;
      default:
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }
    const oauthUserResponse = await fetch(userResponseUrl, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });
    const oauthUser = await oauthUserResponse.json();
    const existingUser = await db.query.oauth_accounts.findFirst({
      where: and(
        eq(oauth_accounts.provider_user_id, oauthUser.id || oauthUser.sub),
        eq(oauth_accounts.provider, provider)
      ),
    });

    if (existingUser) {
      const token = generateSessionToken();
      const session = await createSession(token, existingUser.user_id);
      setSessionTokenCookie(token, session.expiresAt);
      return NextResponse.redirect(String(process.env.NEXT_PUBLIC_APP_URL) + '/dashboard');
    }

    let userEmail: string | null = null;
    // github user email needs to be fetched manually
    // https://stackoverflow.com/questions/35373995/github-user-email-is-null-despite-useremail-scope
    if (!oauthUser.email && provider === 'github') {
      if (emailResponseUrl) {
        const emailResponse = await fetch(emailResponseUrl, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
          },
        });
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((email: { primary: boolean }) => email.primary);
        userEmail = primaryEmail ? primaryEmail.email : null;
      }
    }
    const defaultRole = '';
    const user: T_user_register_secret = {
      provider: provider,
      provider_user_id: oauthUser.id || oauthUser.sub, // .sub is for OPENID
      access_token: tokens.accessToken(),
      refresh_token: tokens.refreshToken() ?? 'none', // github doesn't have refresh token
      role: defaultRole,
      name: oauthUser.name,
      photo: oauthUser.avatar_url ?? oauthUser.picture, // avatar url (github)
      phone: oauthUser.phone,
      email: oauthUser.email ?? userEmail,
    };

    // use cookies cus i need these sensitive values in server side after form submission
    await set_cookie('register_user', user, 10);
    return NextResponse.redirect(String(process.env.NEXT_PUBLIC_APP_URL) + '/auth');
  } catch (e) {
    if (e instanceof OAuth2RequestError && e.message === 'bad_verification_code') {
      // invalid code
      // todo: redirect to login page showing error message as alert
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Internal server error: ' + e }, { status: 500 });
  } finally {
    cookies().delete('oauth_state');
    cookies().delete('code_verifier');
  }
}
