/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  experimental: {
    serverActions: true,
  },
  // ミドルウェアを Node.js ランタイムで実行するように設定
  middleware: {
    // false に設定すると Node.js ランタイムで実行される
    edge: false,
  },
};

module.exports = nextConfig; 