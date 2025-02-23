// external
import { v4 as uuidv4 } from 'uuid';

// db
import { db } from '@/lib/drizzle';
import {
  oauth_accounts,
  tasks,
  users,
} from "@/lib/drizzle/schema";

// services
import {
  type T_role, type T_user_register_secret
} from './types';
import { utils_log_db_error } from './server';
import { createSession, generateSessionToken, setSessionTokenCookie } from '@/lib/lucia/auth';

// #################################################
//              HELPERS
// #################################################

// #################################################
//              USER DB
// #################################################

export const DB_create_user = async (user: T_user_register_secret) => {
  try {
    const userId = uuidv4();

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        name: user.name,
        phone: user.phone,
        photo: user.photo,
        email: user.email,
        role: user.role as T_role,
      });
      await tx.insert(oauth_accounts).values({
        provider: user.provider,
        provider_user_id: user.provider_user_id,
        access_token: user.access_token,
        refresh_token: user.refresh_token,
        user_id: userId,
      });
    });

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId);
    setSessionTokenCookie(sessionToken, session.expiresAt);
  } catch (error) {
    await utils_log_db_error('DB_create_user', error);
    throw `DB_create_user: ${error}`;
  }
};

// export const DB_get_userRoleId = async (role: T_role, userId: string) => {
//   try {
//     if (role === 'resident') {
//       const result = await db.query.users.findFirst({ where: eq(users.id, userId) });
//       if (!result) {
//         return null;
//       }
//       return result.id;
//     } else if (role === 'condo_manager') {
//       const result = await db.query.users.findFirst({ where: eq(users.id, userId) });
//       if (!result) {
//         return null;
//       }
//       return result.id;
//     } else {
//       return null;
//     }
//   } catch (error) {
//     await utils_log_db_error('DB_get_userRoleId', error);
//     throw `DB_get_userRoleId: ${error}`;
//   }
// };
