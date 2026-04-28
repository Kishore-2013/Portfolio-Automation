import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: { timestamp: new Date().toISOString() },
  };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  details?: unknown
): void {
  const response: ApiResponse = {
    success: false,
    error: { message, code, details },
    meta: { timestamp: new Date().toISOString() },
  };
  res.status(statusCode).json(response);
}
