import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '@/shared/shared-utils';

/**
 * MVP version — check a static admin API key from env.
 * Replace with role-based JWT check when user roles are added.
 */
export const adminMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return next(new UnauthorizedError('Admin access required'));
  }
  next();
};
