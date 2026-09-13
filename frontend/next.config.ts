import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
};

export default nextConfig;

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
    value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" // Sesuaikan jika memuat script/style dari pihak ketiga
  }
];

module.exports = {
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
