import morgan from 'morgan';
import { Request, Response } from 'express';
import { logger } from './winston.logs';

morgan.token('id', (req: Request, res: Response) => {
  return res.locals.errorId;
});

const incomingMessage = (tokens: morgan.TokenIndexer<Request, Response>, req: Request, res: Response): string => {
  return [
    `ID:              ${tokens.id(req, res)}`,
    `Method:          ${tokens.method(req, res)}`,
    `URL:             ${tokens.url(req, res)}`,
    `Status:          ${tokens.status(req, res)}`,
    `Content Length:  ${tokens.res(req, res, 'content-length') || '-'}`,
    `Response Time:   ${tokens['response-time'](req, res)} ms`,
  ].join('\n');
};

const infoStream = {
  write: (message: string) => logger.info(message),
};

const errorStream = {
  write: (message: string) => logger.error(message),
};

export const infoMorgan = morgan(incomingMessage, {
  stream: infoStream,
  skip: (req: Request, res: Response) => res.statusCode >= 400,
});

export const errorMorgon = morgan(
  (tokens, req: Request, res: Response) => {
    return [
      `ID:              ${tokens.id(req, res)}`,
      `Method:          ${tokens.method(req, res)}`,
      `URL:             ${tokens.url(req, res)}`,
      `Status:          ${tokens.status(req, res)}`,
      `Content Length:  ${tokens.res(req, res, 'content-length') || '-'}`,
      `Response Time:   ${tokens['response-time'](req, res)} ms`,
      `Error Message:   ${res.locals.errorMessage}`,
      res.locals.errorStack ? `Stack:           ${res.locals.errorStack}` : '',
    ].join('\n');
  },
  {
    stream: errorStream,
    skip: (req: Request, res: Response) => res.statusCode < 400,
  },
);
