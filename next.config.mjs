import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import pkg from 'next-pwa';
const withPWA = pkg.default || pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV !== 'production',
};

const isProd = process.env.NODE_ENV === 'production';

export default {
  ...(isProd ? withPWA(pwaConfig)(nextConfig) : nextConfig),
  allowedDevOrigins: ['http://10.0.0.210:3000'], // ✅ patch moved to export level
};