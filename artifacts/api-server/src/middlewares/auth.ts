import { Request, Response, NextFunction } from 'express';
import { tokenService, TokenPayload } from '../services/token.service';
import { prisma } from '../database/prisma';

export interface AuthUser extends TokenPayload {}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantId?: string; // from tenant.middleware
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token signature and expiration
    const decoded = tokenService.verifyAccessToken(token);
    
    // Fast path: verify token version to ensure token hasn't been revoked globally
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { tokenVersion: true, accountStatus: true }
    });

    if (!user || user.tokenVersion !== decoded.tokenVersion || user.accountStatus !== 'ACTIVE') {
      console.error('[Auth Middleware] Validation failed:', { 
        userId: decoded.id, 
        userFound: !!user, 
        dbTokenVersion: user?.tokenVersion, 
        jwtTokenVersion: decoded.tokenVersion, 
        dbAccountStatus: user?.accountStatus 
      });
      return res.status(401).json({ error: 'Token is no longer valid. Please log in again.' });
    }

    req.user = decoded;
    
    // Set tenantId if present in token and not already set by headers
    if (decoded.spaId && !req.tenantId) {
      req.tenantId = decoded.spaId;
    }
    
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role === 'PLATFORM_ADMIN') {
    return next();
  }

  const requestedSpaId = req.query.spaId || req.body.spaId || req.params.spaId;
  
  if (requestedSpaId && requestedSpaId !== req.tenantId) {
    return res.status(403).json({ error: 'Access to this tenant is forbidden' });
  }

  if (!req.tenantId) {
    return res.status(403).json({ error: 'No tenant context found for user' });
  }

  if (!req.query.spaId) {
    req.query.spaId = req.tenantId;
  }
  
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.body.spaId) {
    req.body.spaId = req.tenantId;
  }

  next();
}
