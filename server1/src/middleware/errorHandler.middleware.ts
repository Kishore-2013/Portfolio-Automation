import { Request, Response, NextFunction } from 'express';
import { AppError, sendError, logger } from '@/shared/shared-utils';

export const errorHandler = (
  err: any, // Using any for safe property checking
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Check if it's a known AppError or has expected properties
  if (err instanceof AppError || (err.statusCode && err.code)) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred';
    const code = err.code || 'APP_ERROR';
    
    logger.warn(`${code}: ${message}`, { details: err.details });
    return sendError(res, statusCode, message, code, err.details);
  }


  // Handle JSON parsing errors (from express.json())
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    logger.warn('JSON parsing failed', { error: err.message });
    return sendError(res, 400, 'Invalid JSON format', 'BAD_REQUEST');
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    logger.warn('File upload error', { error: err.message });
    return sendError(res, 400, `File upload error: ${err.message}`, 'BAD_REQUEST');
  }

  // Handle Disk Space errors (ENOSPC)
  if ((err as any).code === 'ENOSPC') {
    logger.error('CRITICAL: Disk full', err);
    return sendError(res, 507, 'Server storage is completely full. Cannot save files.', 'DISK_FULL');
  }

  logger.error('Unhandled error', err);
  return sendError(
    res, 
    500, 
    err.message || 'Internal server error', 
    'INTERNAL_ERROR', 
    { step: err.step || 'unknown', stack: process.env.NODE_ENV === 'development' ? err.stack : undefined }
  );
};

