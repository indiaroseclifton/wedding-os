import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["konva", "react-konva"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
