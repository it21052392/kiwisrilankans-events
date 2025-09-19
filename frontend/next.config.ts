import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    PORT: '5000',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
