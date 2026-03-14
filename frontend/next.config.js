/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/resumy',
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.stripeassets.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://resumy-backend:3001/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig