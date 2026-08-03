import { Router } from 'express';
import { z } from 'zod';
import { messageController } from '../controllers/message.controller';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

const replySchema = z.object({
  text: z.string().min(1),
  senderName: z.string().optional(),
  sender: z.string().optional(),
});

// Retrieve conversations — scoped to tenant
router.get('/conversations', requireAuth, requireTenant, messageController.getConversations);

// Mark conversation as read
router.patch('/conversations/:id/read', requireAuth, requireTenant, messageController.markRead);

// Reply to a conversation
router.post('/conversations/:id/reply', requireAuth, requireTenant, validate(replySchema), messageController.reply);

export default router;
