import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: string;
  role: string;
  spaId?: string;
  tokenVersion: number;
  isDemo?: boolean;
}

export class TokenService {
  /**
   * Generates a short-lived access token.
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
  }

  /**
   * Verifies an access token and returns the payload.
   * Throws an error if invalid or expired.
   */
  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }
}

export const tokenService = new TokenService();
