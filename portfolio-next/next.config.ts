import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling the native better-sqlite3 module;
  // it runs exclusively in server components and API routes.
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
