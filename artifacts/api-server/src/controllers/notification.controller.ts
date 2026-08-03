import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { prisma } from '../database/prisma';

export class NotificationController {
  
  async registerToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, platform } = req.body;
      const userId = req.user?.id;

      if (!userId || !token || !platform) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const deviceToken = await notificationService.registerToken(userId, token, platform);
      res.json(deviceToken);
    } catch (err) {
      next(err);
    }
  }

  async unregisterToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Missing token' });
      }

      await notificationService.unregisterToken(token);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      try {
        // Fetch last 50 notifications for this user
        const notifications = await prisma.notificationLog.findMany({
          where: { userId },
          orderBy: { sentAt: 'desc' },
          take: 50,
        });
        res.json(notifications);
      } catch (dbErr: any) {
        // Table may not exist yet (migration pending) — return empty array gracefully
        console.warn('NotificationLog table not available:', dbErr.message);
        res.json([]);
      }
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
