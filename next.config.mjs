import createNextIntlPlugin from 'next-intl/plugin';
import { withAxiom } from 'next-axiom';

const withNextIntl = createNextIntlPlugin('./lib/i18n/index.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    'three-stdlib',
    'postprocessing',
  ],
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
const plugins = [withAxiom, withNextIntl];

/** Apply Plugins Sequentially */
const composedConfig = plugins.reduce((acc, plugin) => plugin(acc), nextConfig);

/** Export the Final Configuration */
export default composedConfig;
