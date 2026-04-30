import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack config (Used during 'npm run dev')
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
    },
  },

  // Webpack config (Used during 'npm run build' for production)
  webpack: (config: any) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };
    return config;
  },
};

export default nextConfig;