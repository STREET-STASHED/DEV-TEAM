import process from "process";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable TypeScript errors during build
  },
}

export default nextConfig
