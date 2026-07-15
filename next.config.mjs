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
    // Env strategy: the backend is chosen here (server-side) and baked into the
    // build's route manifest. Set `API_TARGET` at build time to point at a
    // specific backend (e.g. staging); otherwise it falls back to NODE_ENV
    // defaults, so `next dev` hits local and a production build hits psbiis
    // without needing any .env file or NEXT_PUBLIC_* variable.
    const nodeEnv = process.env.NODE_ENV || 'undefined';
    const isDev = nodeEnv === 'development';
    const apiTarget =
      process.env.API_TARGET ||
      (isDev ? 'http://localhost:5000/api2' : 'https://psbiis/api2');
    console.log(
      `[psbnext] env check -> NODE_ENV=${nodeEnv}, mode=${isDev ? 'development' : 'production'}, ` +
        `API_TARGET=${process.env.API_TARGET ? 'explicit' : 'default'}, apiTarget=${apiTarget}`
    );
    return [
      {
        source: '/api2/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
});