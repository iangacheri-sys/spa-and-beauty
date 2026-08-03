import { Router } from 'express';
import { spaController } from '../controllers/spa.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

// Public: anyone can browse spas (discovery)
router.get('/', spaController.getAll);
router.get('/:id', spaController.getById);

// Spa Owner can update their own spa. PLATFORM_ADMIN can update any.
router.put('/:id', requireAuth, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER']), spaController.update);

// Platform Admin can update status
router.patch('/:id/status', requireAuth, requireRole(['PLATFORM_ADMIN']), spaController.updateStatus);

// Only Platform Admin can delete/verify spas
router.delete('/:id', requireAuth, requireRole(['PLATFORM_ADMIN']), (_, res) => {
  res.status(501).json({ error: 'Spa deletion not yet implemented' });
});

export default router;
