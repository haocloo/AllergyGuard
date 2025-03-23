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
      // Cache for Google user profile images
      {
        urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-images-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      // Cache for GitHub avatars
      {
        urlPattern: /^https:\/\/avatars\.githubusercontent\.com\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'github-avatars-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      // Cache for Cloudinary images
      {
        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cloudinary-images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
          },
        },
      },
      // Cache for R2 bucket images
      {
        urlPattern: /^https:\/\/pub-0f5c882960014085b0ec65b6955a6346\.r2\.dev\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'r2-images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
          },
        },
      },
      // Cache for Unsplash images - using RegExp constructor for better handling of complex URLs with query params
      {
        // Use a more permissive pattern that handles query parameters better
        urlPattern: new RegExp('^https://images\\.unsplash\\.com/photo-[a-zA-Z0-9\\-]+'),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'unsplash-photos-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // Original Unsplash pattern as fallback
      {
        urlPattern: /^https:\/\/images\.unsplash\.com\/.*/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'unsplash-images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
          },
        },
      },
      // Source Unsplash images
      {
        urlPattern: /^https:\/\/source\.unsplash\.com\/.*/,
        handler: 'NetworkFirst', // Changed from StaleWhileRevalidate to ensure fresh content
        options: {
          cacheName: 'unsplash-source-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
          networkTimeoutSeconds: 10, // Fall back to cache if network is slow
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // Cache for DiceBear API images
      {
        urlPattern: /^https:\/\/api\.dicebear\.com\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'dicebear-images-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      // Fallback cache for any other image types
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 150,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      // Cache for web fonts
      {
        urlPattern: /\.(?:woff|woff2|eot|ttf|otf)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'font-assets',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
          },
        },
      },
      // Cache for Next.js Image Optimization
      {
        urlPattern: /\/_next\/image\?url=.+/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-image-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
          },
        },
      },
      // API routes caching
      {
        urlPattern: /\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 1 * 24 * 60 * 60, // 1 day
          },
          networkTimeoutSeconds: 10,
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
