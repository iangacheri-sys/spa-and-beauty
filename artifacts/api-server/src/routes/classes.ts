import { Router } from 'express';
import { classController } from '../controllers/class.controller';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth';

const router = Router();

// Public: anyone can browse classes
router.get('/', classController.getAll);
router.get('/:id', classController.getById);

import { classEnrollmentController } from '../controllers/class-enrollment.controller';

// Protected: only spa staff can create/modify classes
router.post('/', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), classController.create);
router.put('/:id', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), classController.update);
router.delete('/:id', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), classController.delete);

// Client actions
router.post('/:id/enroll', requireAuth, classEnrollmentController.enroll);
router.delete('/:id/enroll', requireAuth, classEnrollmentController.cancel);

export default router;
