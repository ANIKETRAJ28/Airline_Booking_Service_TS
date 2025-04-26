import { Pool } from 'pg';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, NODE_ENV } from '../config/env.config';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: DB_HOST,
      port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    if (NODE_ENV === 'production') {
      pool.on('error', (error) => {
        console.log('Unexpected error on idle client', error);
        process.exit(1);
      });
      const shutdown = async (): Promise<void> => {
        await pool?.end();
        console.log('Database pool has ended');
        process.exit(0);
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    }
  }
  return pool;
}
