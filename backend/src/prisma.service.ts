import { Injectable  } from '@nestjs/common';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from './generated/prisma/client.js'; // Points to your custom output folder

@Injectable()
export class PrismaService   {
  public client: PrismaClient;

  constructor() {
    // Exact SQL configuration requiring self-signed cert trust
    const sqlConfig = {
      user: 'GF220',
      password: 'pa$$w0rd',
      database: 'GF220',
      server: 'PSBIIS',
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      options: {
        encrypt: true,
        trustServerCertificate: true, // Crucial for your internal network setup
      },
    };

    const adapter = new PrismaMssql(sqlConfig);

    // Instantiate client using driver adapter mapping
    this.client = new PrismaClient({
      adapter,
      //log: ['query', 'info', 'warn', 'error']
    });
  }

  
}
