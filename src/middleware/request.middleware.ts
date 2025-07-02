import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export function requestMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.id = (req.headers['x-request-id'] as string) || randomUUID();
  res.locals.errorId = req.id;
  res.setHeader('X-Request-ID', req.id);
  next();
}
