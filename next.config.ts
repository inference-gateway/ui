import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    forceSwcTransforms: true,
  },
  env: {
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV || 'development',
  },
  webpack: config => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;
