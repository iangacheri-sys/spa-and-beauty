import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle Prisma known request errors (e.g. unique constraint)
  if (err?.code === 'P2002') {
    return res.status(409).json({
      error: 'A record with this value already exists',
      field: err?.meta?.target,
    });
  }

  // Handle Prisma not found errors
  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  logger.error({ err, url: req.url, method: req.method }, 'Unhandled Error');

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
