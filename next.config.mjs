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
  // 忽略 mobile 目录和相关包
  webpack: (config, { isServer }) => {
    // 忽略文件监听
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/mobile/**', '**/node_modules/**']
    };
    
    // 排除移动端相关的模块
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push(
        'expo-router',
        'expo',
        '@expo/vector-icons',
        'react-native',
        'react-native-web'
      );
    }
    
    // 添加 resolve 别名来避免解析移动端模块
    config.resolve.alias = {
      ...config.resolve.alias,
      'expo-router': false,
      'expo': false,
      '@expo/vector-icons': false,
      'react-native': false,
    };
    
    return config;
  },
  // 排除 mobile 目录
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transpilePackages: [],
};

export default nextConfig;
