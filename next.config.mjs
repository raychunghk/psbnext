import bundleAnalyzer from '@next/bundle-analyzer';
import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';

// ── Logger setup (must be synchronous for next.config.mjs) ──
const LOG_DIR = path.resolve('.', 'log');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, source, message, stack }) => {
    const src = source || 'config';
    let line = `${timestamp} [${level.toUpperCase()}] [${src}] ${message}`;
    if (stack) line += `\n${stack}`;
    return line;
  })
);

const configLogger = createLogger({
  level: 'info',
  transports: [
    new transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      format: logFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new transports.Console({
      format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.colorize(), format.simple()),
    }),
  ],
});

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

    configLogger.info(`Resolved environment`, {
      source: 'next-config',
      nodeEnv,
      mode: isDev ? 'development' : 'production',
      apiTarget: process.env.API_TARGET ? 'explicit' : 'default',
    });

    return [
      {
        source: '/api2/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
});
