import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["react", "next/script"],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
