import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  reactStrictMode: false,
  output: 'standalone', 
  basePath: '/next',

  // 1. Move it here as a top-level configuration key:
  outputFileTracingIncludes: {
    '/**': ['./node_modules/@swc/helpers/**/*'],
  },
  
  experimental: {
    // Keep only true experimental options here
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5000/api/:path*',
      },
    ];
  },
});