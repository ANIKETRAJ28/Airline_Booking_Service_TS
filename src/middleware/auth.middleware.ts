import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../util/api.util';
import { errorHandler } from '../util/apiHandler.util';

export function jwtMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const jwtCookie = req.cookies['JWT'];
    if (!jwtCookie) {
      throw new ApiError(401, 'Unauthorized');
    }
    const decodedToken = jwt.decode(jwtCookie);
    if (!decodedToken || typeof decodedToken === 'string' || !decodedToken.exp) {
      throw new ApiError(401, 'Unauthorized');
    }
    if (decodedToken.exp * 1000 < Date.now()) {
      throw new ApiError(401, 'Unauthorized');
    }
    req.user_id = decodedToken.id;
    req.email = decodedToken.email;
    req.user_role = decodedToken.user_role;
    next();
  } catch (error) {
    errorHandler(error, res);
  }
}

export function checkSuperAdminRole(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.user_role) {
      throw new ApiError(403, 'Forbidden');
    }
    if (req.user_role !== 'superadmin') {
      throw new ApiError(403, 'Forbidden');
    }
    next();
  } catch (error) {
    errorHandler(error, res);
  }
}

export function checkAdminRole(req: Request, res: Response, next: NextFunction): void {
  try {
    if (req.user_role !== 'admin') {
      throw new ApiError(403, 'Forbidden');
    }
    next();
  } catch (error) {
    errorHandler(error, res);
  }
}
