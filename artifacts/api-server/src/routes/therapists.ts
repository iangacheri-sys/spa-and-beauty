import { Router } from 'express';
import { therapistController } from '../controllers/therapist.controller';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth';

const router = Router();

// Public: anyone can browse therapists for a spa
router.get('/', therapistController.getAll);
router.get('/:id', therapistController.getById);

// Protected: only spa management can manage therapists
router.post('/', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), therapistController.create);
router.put('/:id', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), therapistController.update);
router.delete('/:id', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), therapistController.delete);

export default router;
