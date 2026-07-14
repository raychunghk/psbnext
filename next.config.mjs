import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  basePath: '/next',
  async rewrites() {
    return [
      {
        source: '/api2/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/api2/:path*'
          : 'https://psbiis/api2/:path*',
      },
    ];
  },
});