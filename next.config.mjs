/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: [],
  },
  // 忽略 mobile 目录
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/mobile/**', '**/node_modules/**']
    };
    return config;
  },
  // 排除 mobile 目录
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transpilePackages: [],
};

export default nextConfig;
