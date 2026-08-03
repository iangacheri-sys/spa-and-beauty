import { Request, Response, NextFunction } from 'express';

/**
 * Prevents demo accounts from performing destructive production actions.
 * Only blocks if the user is explicitly flagged as isDemo = true.
 */
export function demoGuard(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.isDemo) {
    return res.status(403).json({ 
      error: 'Demo Account Restriction', 
      message: 'This action cannot be performed by a demo account.' 
    });
  }
  next();
}
