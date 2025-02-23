import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '../globals.css';

// external
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Locale } from '@/lib/i18n/config';
import NextTopLoader from 'nextjs-toploader';
import { AxiomWebVitals } from 'next-axiom';
import { GoogleAnalytics } from '@next/third-parties/google';

// ui
import { Toaster } from '@/components/ui/toaster';

// pui
import Providers from '@/components/layout/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Apex',
    description:
      'All-in-one career platform featuring AI mock interviews, resume builder, job applications, and employer hiring tools. Practice with voice recognition, get AI feedback, and connect with employers.',
    keywords: [
      'resume builder',
      'AI mock interview',
      'job search',
      'career platform',
      'voice recognition interview',
      'job applications',
      'employer hiring',
      'interview practice',
      'career development',
      'skill matching',
    ],
    authors: [{ name: 'Apex Team' }],
    openGraph: {
      title: 'Apex - AI-Powered Career Platform',
      description:
        'All-in-one career platform featuring AI mock interviews, resume builder, job applications, and employer hiring tools.',
      type: 'website',
      locale: 'en_US',
      siteName: 'Apex',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Apex - AI-Powered Career Platform',
      description:
        'All-in-one career platform featuring AI mock interviews, resume builder, job applications, and employer hiring tools.',
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: 'Career Development',
    icons: {
      icon: [
        // Default favicon
        {
          url: '/favicon/favicon.ico',
          sizes: 'any',
        },
        // Android Chrome
        {
          url: '/favicon/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          url: '/favicon/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        // For iOS devices
        {
          url: '/favicon/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
      // Shortcut icon (legacy support)
      shortcut: '/favicon/favicon.ico',
      // Apple touch icon
      apple: [
        {
          url: '/favicon/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning={isDev}
      className="h-dvh w-screen max-w-[1650px] overflow-x-hidden overflow-y-hidden"
    >
      <body
        className={`${inter.variable} w-screen mx-auto h-full flex flex-row font-sans antialiased `}
      >
        <NextIntlClientProvider messages={messages}>
          <NextTopLoader
            color="#a379ff"
            initialPosition={0.08}
            crawlSpeed={200}
            height={4}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={1000}
            shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          />
          <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID as string} />
          <AxiomWebVitals />
          {/* dont remove Toaster, it's for toast to work */}
          <Toaster />
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
