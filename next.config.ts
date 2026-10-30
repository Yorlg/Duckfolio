import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  outputFileTracingIncludes: {
    '/photos': ['./photos/**/*'],
    '/photos/*': ['./photos/**/*'],
    '/api/admin/photos': ['./photos/**/*'],
  },
  async rewrites() {
    return [
      {
        destination: '/api/media/:path*',
        source: '/media/:path*',
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
