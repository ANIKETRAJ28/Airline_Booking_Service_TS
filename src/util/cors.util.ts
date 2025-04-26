import { FRONTEND_URL } from '../config/env.config';

export const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
};
