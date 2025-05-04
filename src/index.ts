import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { corsOptions } from './util/cors.util';
import { PORT } from './config/env.config';
import { router } from './routes/index.route';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is alive' });
  return;
});

app.use('/api/v1', router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
