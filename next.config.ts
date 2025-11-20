import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Optimize for production
  compress: true,

  // Configure Puppeteer for Docker
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium'],
  },
};

export default nextConfig;
