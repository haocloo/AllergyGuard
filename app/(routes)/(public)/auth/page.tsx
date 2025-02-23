import { redirect } from 'next/navigation';
import { Metadata } from 'next';

// services
import { get_cookie, lucia_get_user } from '@/services/server';
import { T_user_register_secret } from '@/services/types';
import { RATE_LIMITS } from '@/services/common';

// pui
import { AuthClient } from './_comp/client';

export const metadata: Metadata = {
  title: 'Auth | Apex',
  description: 'Authentication page for Apex.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { user } = await lucia_get_user();

  // existing users cannot acccess
  if (user) {
    return redirect('/dashboard');
  }

  let sessionData: T_user_register_secret | null = null;

  try {
    const { value } = await get_cookie('register_user');
    // even if cookie compromised, it will expire in 1 day
    sessionData = value as T_user_register_secret;
  } catch (error) {
    throw error;
  }
  const rateLimitFeature = (searchParams.rateLimit as keyof typeof RATE_LIMITS) || undefined;

  return <AuthClient rateLimitFeature={rateLimitFeature} sessionData={sessionData} />;
}
