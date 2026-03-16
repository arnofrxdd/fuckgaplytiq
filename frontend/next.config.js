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
    const isDev = process.env.NODE_ENV === 'development';
    const backendUrl = isDev ? 'http://127.0.0.1:3001' : 'http://resumy-backend:3001';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/resumy',
        basePath: false,
        permanent: false,
      },
    ];
  },
  webpack: (config, { webpack, isServer }) => {
    // Aggressively ignore onnxruntime-node to prevent the build from parsing faulty .mjs files
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^onnxruntime-node$/,
      })
    );

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        module: false,
        perf_hooks: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig