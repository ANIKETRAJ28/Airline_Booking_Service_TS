import { DatabaseError } from 'pg';
import { ApiError, ApiResponse } from './api.util';
import { Response } from 'express';

export function errorHandler(error: ApiError | DatabaseError | unknown, res: Response): void {
  if (error instanceof ApiError || error instanceof DatabaseError) {
    res.locals.errorMessage = error.message;
    res.locals.errorStack = error.stack;
    if (error instanceof DatabaseError) {
      const response = new ApiResponse(error.message, null, 500);
      res.status(response.getStatusCode()).json(response.toJSON());
      return;
    }
    res.status(error.getStatusCode()).json(error.toJSON());
  } else {
    res.locals.errorMessage = 'Internal Server Error';
    res.locals.errorStack = '';
    const response = new ApiResponse('Internal Server Error', null, 500);
    res.status(response.getStatusCode()).json(response.toJSON());
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function apiHandler(res: Response, status?: number, message?: string, data?: any): void {
  const response = new ApiResponse(message || 'Success', data || null, status || 200);
  res.status(response.getStatusCode()).json(response.toJSON());
}
