// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user_id?: string;
      email?: string;
      user_role?: 'user' | 'admin' | 'superadmin';
    }
  }
}
