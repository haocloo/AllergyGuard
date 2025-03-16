'use client';

// external
import { useTheme } from 'next-themes';
import { cn } from '@/lib/cn';
import { useTranslations } from 'next-intl';

// ui
import { MagicCard } from '@/components/magicui/magic-card';
import AnimatedGridPattern from '@/components/magicui/animated-grid-pattern';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// pui
import { GoogleLogin } from '@/components/layout/google-login';
import SignUpForm from './SignUpForm';
import { RateLimitExceeded } from '@/components/helpers/rate-limit';

// services
import { RATE_LIMITS } from '@/services/common';
import { T_user_register_secret } from '@/services/types';

export function AuthClient({
  rateLimitFeature,
  sessionData,
}: {
  rateLimitFeature: keyof typeof RATE_LIMITS | undefined;
  sessionData: T_user_register_secret | undefined;
}) {
  const { theme } = useTheme();
  const tAuth = useTranslations('auth');
  return (
    <div className=" relative size-full flex items-center justify-center">
      <AnimatedGridPattern
        numSquares={60}
        maxOpacity={0.2}
        duration={2}
        repeatDelay={1}
        className={cn(
          '[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]',
          'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12'
        )}
      />
      <div
        className={`relative z-1
         ${!!sessionData ? 'max-w-sm' : 'w-fit'} p-2
        flex flex-col items-start justify-center shadow-2xl rounded-lg bg-background/70`}
      >
        <CardHeader>
          <CardTitle className="mb-4">{sessionData ? tAuth('sign up') : tAuth('login')}</CardTitle>
          <GoogleLogin selectedEmail={sessionData?.email || ''} />
        </CardHeader>
        {rateLimitFeature && <RateLimitExceeded feature={rateLimitFeature} />}
        <div className=" w-full">
          {!!sessionData && (
            <CardContent>
              <SignUpForm
                name={sessionData.name}
                phone={sessionData.phone}
                role={sessionData.role}
              />
            </CardContent>
          )}
        </div>
      </div>
    </div>
  );
}
