import jwt from 'jsonwebtoken';

import { NextFunction, Request, Response } from 'express';

export function jwtMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const jwtCookie = req.cookies['JWT'];
    if (!jwtCookie) {
      res.status(501).json({ message: 'unauthorized' });
      return;
    }
    const decodedToken = jwt.decode(jwtCookie);
    if (!decodedToken || typeof decodedToken === 'string' || !decodedToken.exp) {
      res.clearCookie('JWT');
      res.status(501).json({ message: 'unauthorized' });
      return;
    }
    if (decodedToken.exp * 1000 < Date.now()) {
      res.clearCookie('JWT');
      res.status(501).json({ message: 'unauthorized' });
    }
    req.id = decodedToken.id;
    req.email = decodedToken.email;
    req.user_role = decodedToken.user_role;
    next();
  } catch (error) {
    console.error('Error in jwtMiddleware:', error);
    res.status(501).json({ message: 'unauthorized' });
  }
}

export function checkSuperAdminRole(req: Request, res: Response, next: NextFunction): void {
  if (!req.user_role) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  if (req.user_role !== 'superadmin') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  next();
}

export function checkAdminRole(req: Request, res: Response, next: NextFunction): void {
  if (req.user_role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  next();
}
