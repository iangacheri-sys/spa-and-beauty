import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

// All AI routes require authentication
router.use(requireAuth);

// Customer-facing concierge (mobile app)
router.post('/chat', aiController.chat);

// Spa Owner admin advisor - only for owners/managers
router.post('/admin-chat', requireRole(['SPA_OWNER', 'MANAGER', 'PLATFORM_ADMIN']), aiController.adminChat);

// AI marketing campaign generator - only for owners/managers
router.post('/generate-marketing', requireRole(['SPA_OWNER', 'MANAGER', 'PLATFORM_ADMIN']), aiController.generateMarketing);

export default router;
