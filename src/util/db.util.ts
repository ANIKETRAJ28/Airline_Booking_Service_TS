import { DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, DB_NAME } from '../config/env.config';

export const config = {
  user: DB_USER as string,
  password: DB_PASSWORD as string,
  host: DB_HOST as string,
  port: parseInt(DB_PORT as string),
  database: DB_NAME as string,
};
