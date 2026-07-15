import 'dotenv/config';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from '../generated/prisma/client';

const sqlConfig = {
  user: 'GF220',
  // eslint-disable-next-line prettier/prettier
  password: 'pa$$w0rd',
  database: 'GF220',
  server: `PSBIIS`,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    // CRITICAL FIX: Set this to true to allow self-signed certificates
    trustServerCertificate: true,
  },
};

const adapter = new PrismaMssql(sqlConfig);
const prisma = new PrismaClient({ adapter });

export { prisma };
