import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';

export class MessageController {
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      // The tenant middleware injects spaId into req.query if present.
      const spaId = req.query.spaId as string;
      if (!spaId) {
         return res.status(400).json({ error: 'spaId is required' });
      }
      const items = await messageService.getConversations(spaId);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await messageService.markAsRead(req.params.id as string);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async reply(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, senderName } = req.body;
      const user = (req as any).user;
      const msg = await messageService.reply(req.params.id as string, text, senderName, user?.id);
      res.status(201).json(msg);
    } catch (err) {
      next(err);
    }
  }
}

export const messageController = new MessageController();
