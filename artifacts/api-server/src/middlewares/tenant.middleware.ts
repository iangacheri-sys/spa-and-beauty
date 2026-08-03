import { Request, Response, NextFunction } from 'express';

// Express Request extension for tenant
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Try to get spaId from headers for public multi-tenant routes
  const spaId = req.headers['x-spa-id'] as string;
  
  if (spaId) {
    req.tenantId = spaId;
  }

  next();
}
