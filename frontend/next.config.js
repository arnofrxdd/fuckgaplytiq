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
  transpilePackages: ['@imgly/background-removal'],
  webpack: (config, { isServer }) => {
    // 1. Tell webpack NOT to parse the faulty node-specific ONNX file
    config.module.noParse = [
      ...(config.module.noParse || []),
      /ort\.node\.min\.mjs$/,
    ];

    // 2. Alias it to false so it's not even attempted to be loaded
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node': false,
    };

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