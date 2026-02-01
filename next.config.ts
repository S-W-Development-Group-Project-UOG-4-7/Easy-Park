import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid Turbopack picking an incorrect workspace root when multiple lockfiles exist.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
