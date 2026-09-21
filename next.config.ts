import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'firebase'],
  },
};

export default nextConfig;
