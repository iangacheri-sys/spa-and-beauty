import { Router } from 'express';
import { z } from 'zod';
import { serviceController } from '../controllers/service.controller';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

const createServiceSchema = z.object({
  spaId: z.string().uuid().optional(), // injected by requireTenant if missing
  name: z.string().min(2).max(100),
  category: z.string().min(2).max(50),
  duration: z.number().int().positive('Duration must be a positive number of minutes'),
  price: z.number().positive('Price must be positive'),
  description: z.string().max(1000).optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateServiceSchema = createServiceSchema.partial();

// Public: anyone can browse services for a spa
router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);

// Protected: only spa staff can mutate services
router.post('/', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), validate(createServiceSchema), serviceController.create);
router.put('/:id', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), validate(updateServiceSchema), serviceController.update);
router.delete('/:id', requireAuth, requireTenant, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), serviceController.delete);

export default router;
