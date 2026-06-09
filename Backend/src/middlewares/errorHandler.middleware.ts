import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'An unknown error occurred. Please contact support.';
  const errorCode = err.errorCode || 'ERR_500';

  res.status(status).json({
    errorCode,
    message,
    details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.stack : String(err)) : undefined,
  });
};
