import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turboMode: false, // Disable Turbopack
  },
};

export default nextConfig;
