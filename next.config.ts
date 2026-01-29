import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import type { NextConfig } from 'next';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig: NextConfig = {
  /* config options here */
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
      {
        source: '/config.yml',
        destination: '/admin/config.yml',
      },
    ];
  },
};

if (process.env.NODE_ENV === 'development') {
  (async () => {
    await setupDevPlatform();
  })();
}

export default nextConfig;
