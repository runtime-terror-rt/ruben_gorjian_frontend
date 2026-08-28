import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  experimental: {
    // Disabling workerThreads to improve Turbopack stability
    workerThreads: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "talexia.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: '/pricing', destination: '/plan', permanent: true },
      { source: '/execution-case-studies', destination: '/', permanent: true },
      { source: '/terms-conditions', destination: '/terms', permanent: true },
      { source: '/refund-policy', destination: '/terms', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/cookie-policy', destination: '/privacy', permanent: true },
      { source: '/data-usage', destination: '/privacy', permanent: true },
      { source: '/api-data-disclosure', destination: '/privacy', permanent: true },
      { source: '/content-disclaimer', destination: '/privacy', permanent: true },
      { source: '/newhome', destination: '/', permanent: true },
      { source: '/newhome/faq', destination: '/faq', permanent: true },
      { source: '/newhome/contact', destination: '/contact', permanent: true },
      { source: '/newhome/case-studies', destination: '/', permanent: true },
      { source: '/features', destination: '/', permanent: true },
      { source: '/about', destination: '/', permanent: true },
      { source: '/services', destination: '/', permanent: true },
      { source: '/blog', destination: '/', permanent: true },
      { source: '/careers', destination: '/', permanent: true },
      { source: '/home', destination: '/', permanent: true },
      { source: '/index', destination: '/', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/signup',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/brandbrief',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
