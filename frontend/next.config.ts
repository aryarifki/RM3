import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN' 
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains' 
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff' 
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()' 
  },
  {
    key: 'Content-Security-Policy',
    // Tambahkan 'unsafe-inline' pada script-src agar Next.js bisa berjalan
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" 
  }
];

const nextConfig: NextConfig = {
  poweredByHeader: false, 
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
