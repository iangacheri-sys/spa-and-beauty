import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth';

const router = Router();

// Public: anyone can browse products for a spa
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Protected: only spa staff can mutate products
router.post('/', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), productController.create);
router.put('/:id', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), productController.update);
router.delete('/:id', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), productController.delete);

export default router;
