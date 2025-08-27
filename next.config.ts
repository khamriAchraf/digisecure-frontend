import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    // Don't fail the build on ESLint errors (Docker/CI builds keep going)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
