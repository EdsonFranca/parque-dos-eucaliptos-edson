import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  serverExternalPackages: ['@xenova/transformers', 'pdf-parse'],
};

export default nextConfig;
