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
    // Single combined IIS app: the Next.js server (this app, under /next) proxies
    // every `${basePath}/api2/*` request to the NestJS backend running as a local
    // process on the same machine. There is no production/development switch — the
    // backend is always reached over loopback, so the same build works everywhere.
    // Override the port/host with `API_TARGET` only if the backend does not listen
    // on the default below.
    const apiTarget = process.env.API_TARGET || 'http://localhost:5000/api2';
    console.log(`[psbnext] rewrite /api2/* -> ${apiTarget}/*`);
    return [
      {
        source: '/api2/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
});