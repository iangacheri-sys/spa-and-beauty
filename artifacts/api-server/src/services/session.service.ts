import { prisma } from '../database/prisma';
import crypto from 'crypto';

export class SessionService {
  /**
   * Creates a new session in the database.
   */
  async createSession(userId: string, deviceInfo?: string, ipAddress?: string) {
    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const session = await prisma.session.create({
      data: {
        userId,
        refreshToken,
        deviceInfo,
        ipAddress,
        expiresAt,
      }
    });

    return session;
  }

  /**
   * Validates and retrieves an active session by refresh token.
   * Checks if it's revoked or expired.
   */
  async getValidSession(refreshToken: string) {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true }
    });

    if (!session) {
      throw new Error('Invalid refresh token');
    }

    if (session.isRevoked) {
      throw new Error('Session has been revoked');
    }

    if (session.expiresAt < new Date()) {
      throw new Error('Session has expired');
    }

    // Update last activity asynchronously
    prisma.session.update({
      where: { id: session.id },
      data: { lastActive: new Date() }
    }).catch(console.error);

    return session;
  }

  /**
   * Revokes a specific session.
   */
  async revokeSession(refreshToken: string) {
    await prisma.session.updateMany({
      where: { refreshToken },
      data: { isRevoked: true }
    });
  }

  /**
   * Revokes all active sessions for a user.
   */
  async revokeAllUserSessions(userId: string) {
    await prisma.session.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true }
    });
  }
  
  /**
   * Gets all active sessions for a user
   */
  async getUserSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
      orderBy: { lastActive: 'desc' },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        lastActive: true,
      }
    });
  }
}

export const sessionService = new SessionService();
