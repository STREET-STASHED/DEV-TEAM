import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const baseConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@heroicons/react'],
  },
  // Force dynamic rendering for all pages
  output: 'standalone',
  trailingSlash: false,
  generateEtags: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ofccxjxowebslrcuynrw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // PWA and mobile optimization
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Mobile optimization headers
          {
            key: 'Viewport-Width',
            value: 'device-width',
          },
          {
            key: 'X-UA-Compatible',
            value: 'IE=edge',
          },
        ],
      },
    ]
  },
  // Webpack optimization for mobile
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting for mobile
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    return config
  },
}

<<<<<<< Current (Your changes)
=======
// Enable bundle analyzer when ANALYZE=true. Export a single config.
const nextConfig = process.env.ANALYZE ? withBundleAnalyzer(baseConfig) : baseConfig
>>>>>>> Incoming (Background Agent changes)
export default nextConfig
