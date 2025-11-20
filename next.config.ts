import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Optimize for production
  compress: true,

  // Configure Puppeteer for Docker (Next.js 16+)
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium'],
};

export default nextConfig;
