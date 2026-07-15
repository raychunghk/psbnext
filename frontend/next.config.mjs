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
        // Requests matching /psb/api/:path* are sent straight to NestJS internally
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5000/api/:path*',
      },
    ];
  },
});