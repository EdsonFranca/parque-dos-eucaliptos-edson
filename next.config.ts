import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  //reactCompiler: false,
  //serverExternalPackages: ['@xenova/transformers', 'pdf-parse'],
  typescript: {
    // Isso permite que o build termine mesmo com erros de tipagem
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
