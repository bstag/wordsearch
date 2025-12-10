import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Optional: Change the output directory `out` -> `dist`
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  // Base path for GitHub Pages (if not at root domain)
  // Set NEXT_PUBLIC_BASE_PATH environment variable in your GitHub Actions workflow
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default nextConfig;
