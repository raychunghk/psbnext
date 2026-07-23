import path from 'path';
import fs from 'fs';
import winston from 'winston';

// Ensure the /log directory exists at the project root
const LOG_DIR = path.resolve(process.cwd(), 'log');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Custom format: timestamp [LEVEL] [source] message
 * Matches the team logging convention from WORKFLOW.md.
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, source, message, stack }) => {
    const src = source || 'app';
    let line = `${timestamp} [${level.toUpperCase()}] [${src}] ${message}`;
    if (stack) {
      line += `\n${stack}`;
    }
    return line;
  })
);

/**
 * JSON format for machine-readable log files (used alongside the human-friendly
 * format so downstream log aggregators can parse structured data).
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

/**
 * Application logger.
 *
 * Usage (server-side only):
 *   import { logger } from '@/lib/logger';
 *   logger.info('Server started', { source: 'bootstrap' });
 *   logger.error('Failed to connect', { source: 'database', error: err });
 *
 * Three transports:
 *   1. combined.log   – all levels (human-friendly)
 *   2. error.log      – errors only (human-friendly)
 *   3. console        – all levels, colourised (dev convenience)
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // ── File: all logs ──
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
    }),

    // ── File: errors only ──
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),

    // ── Console (dev) ──
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, source, message, stack }) => {
          const src = source || 'app';
          let line = `${timestamp} ${level} [${src}] ${message}`;
          if (stack) {
            line += `\n${stack}`;
          }
          return line;
        })
      ),
    }),
  ],
});

/**
 * Convenience wrappers that automatically attach a source label.
 * Use these instead of raw logger.* when the caller is obvious.
 */
export function logInfo(source: string, message: string, meta?: Record<string, unknown>) {
  logger.info(message, { source, ...meta });
}

export function logWarn(source: string, message: string, meta?: Record<string, unknown>) {
  logger.warn(message, { source, ...meta });
}

export function logError(source: string, message: string, meta?: Record<string, unknown>) {
  logger.error(message, { source, ...meta });
}

export function logDebug(source: string, message: string, meta?: Record<string, unknown>) {
  logger.debug(message, { source, ...meta });
}

export default logger;
