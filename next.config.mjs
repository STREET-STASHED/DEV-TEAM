import process from "process";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint for production builds
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking for production builds
  },
}

export default nextConfig
