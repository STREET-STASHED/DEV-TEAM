const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: ['development', 'test'].includes(process.env.NODE_ENV),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  async rewrites() {
    return [
      {
        source: '/service-worker.js',
        destination: '/_next/static/service-worker.js',
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: process.env.NODE_ENV === "development"
          ? [
              {
                key: "Content-Security-Policy",
                value:
                  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src * blob: data:; connect-src *; font-src *; frame-src *;",
              },
            ]
          : [],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);