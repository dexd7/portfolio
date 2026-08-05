import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Phase 7 will add security headers here (CSP, Referrer-Policy, etc).
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [{ source: '/about', destination: '/', permanent: true }]
  },
}

export default nextConfig
