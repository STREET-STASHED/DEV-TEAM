import process from "process";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              process.env.NODE_ENV === "production"
                ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://maps.googleapis.com wss://*.supabase.co; frame-src https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self';"
                : "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },

  // Environment-specific configurations
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization
  images: {
    domains: [
      "localhost",
      "supabase.co",
      "*.supabase.co",
      "stripe.com",
      "maps.googleapis.com",
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },

  // Webpack configuration for production
  webpack: async (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            enforce: true,
          },
        },
      };
    }

    // Bundle analyzer (optional)
    if (process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = await import("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
        }),
      );
    }

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      "@heroicons/react",
      "@headlessui/react",
      "framer-motion",
      "lucide-react",
    ],
  },

  // Redirects for SEO and user experience
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/products",
        destination: "/buyer/marketplace",
        permanent: true,
      },
    ];
  },

  // Rewrites for API proxying (if needed)
  async rewrites() {
    return [
      {
        source: "/api/health",
        destination: "/api/health",
      },
    ];
  },

  // Using default output; SSR supported by dev/prod server when used with Capacitor server.url

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: process.env.IGNORE_TYPE_ERRORS === "true",
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: process.env.IGNORE_ESLINT_ERRORS === "true",
  },

  // React strict mode
  reactStrictMode: true,

  // Handle hydration errors in WebView
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Trailing slash configuration
  // trailingSlash is set above for export

  // Asset prefix for CDN (if using)
  assetPrefix: process.env.ASSET_PREFIX || "",

  // Base path for subdirectory deployment
  basePath: process.env.BASE_PATH || "",

  // Custom server configuration
  serverRuntimeConfig: {
    // Will only be available on the server side
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    jwtSecret: process.env.JWT_SECRET,
  },

  publicRuntimeConfig: {
    // Will be available on both server and client
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
  },
};

export default nextConfig;
