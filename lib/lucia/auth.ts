import { cookies } from "next/headers";

// external
import { GitHub, Google } from "arctic";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

// db
import { users, sessions } from "@/lib/drizzle/schema";
import { db } from "@/lib/drizzle";
import { eq } from "drizzle-orm";

// import { webcrypto } from "crypto";
// globalThis.crypto = webcrypto as unknown as Crypto;

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(token: string, userId: string): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const sessionData: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(sessions).values(sessionData);
  return sessionData;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId));

  if (result.length < 1) {
    return { session: null, user: null };
  }

  const { user, session: sessionData } = result[0];

  if (Date.now() >= sessionData.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, sessionData.id));
    return { session: null, user: null };
  }

  if (Date.now() >= sessionData.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    sessionData.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessions)
      .set({
        expiresAt: sessionData.expiresAt,
      })
      .where(eq(sessions.id, sessionData.id));
  }

  return { session: sessionData, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export function deleteSessionTokenCookie(): void {
  cookies().delete("session");
}

export type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };

export function setSessionTokenCookie(token: string, expiresAt: Date): void {
  cookies().set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

// redirect URIs means the callback URL after successful login
export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  process.env.NEXT_PUBLIC_APP_URL + "/api/auth/github/callback"
);

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.NEXT_PUBLIC_APP_URL + "/api/auth/google/callback" // if invalid uri error, recreate the oauth token
);
