import createNextIntlPlugin from 'next-intl/plugin';
import { withAxiom } from 'next-axiom';
import withPWA from 'next-pwa';

const withNextIntl = createNextIntlPlugin('./lib/i18n/index.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    // Force SW to be generated in production
    buildExcludes: [/middleware-manifest\.json$/],
    // Include manifest explicitly if it exists
    importScripts: ['/pwa/workbox-*.js'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/allergy-guard\.vercel\.app\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'allergy-guard-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
        },
      },
    ],
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@smithy', 'util-stream'],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'pub-0f5c882960014085b0ec65b6955a6346.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
      encoding: 'encoding',
    });

    return config;
  },
};

/** Array of Plugins to Apply */
const plugins = [withPWA, withAxiom, withNextIntl];

/** Apply Plugins Sequentially */
const composedConfig = plugins.reduce((acc, plugin) => plugin(acc), nextConfig);

/** Export the Final Configuration */
export default composedConfig;
