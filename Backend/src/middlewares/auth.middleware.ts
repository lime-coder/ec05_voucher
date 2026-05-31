import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check for Authorization header and verify JWT token
  // If valid, attach user to req.user and call next()
  // If invalid, return 401 Unauthorized
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if req.user has the required role (e.g., "ADMIN")
    // If yes, call next(). If no, return 403 Forbidden.
  };
};
