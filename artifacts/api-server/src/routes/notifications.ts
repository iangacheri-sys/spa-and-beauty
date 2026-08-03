import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// All notification routes require authentication
router.use(requireAuth);

// Register a device token for push notifications
router.post('/register-token', notificationController.registerToken);

// Unregister a token (e.g. on logout)
router.post('/unregister-token', notificationController.unregisterToken);

// Fetch user's notification history
router.get('/history', notificationController.getHistory);

export default router;
