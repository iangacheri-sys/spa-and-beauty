import { Router } from 'express';
import { z } from 'zod';
import { reviewController } from '../controllers/review.controller';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

const createReviewSchema = z.object({
  spaId: z.string().uuid(),
  therapistId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  bookingId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
  photos: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  photos: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isVisible: z.boolean().optional(),
  ownerReply: z.string().optional(),
});

router.get('/', reviewController.getAll);
router.get('/:id', reviewController.getById);

// Creating a review requires authentication
router.post('/', requireAuth, validate(createReviewSchema), reviewController.create);

// Updating a review (owner replying or hiding)
router.put('/:id', requireAuth, validate(updateReviewSchema), reviewController.update);

// Deleting a review requires admin or spa owner
router.delete('/:id', requireAuth, requireRole(['PLATFORM_ADMIN', 'SPA_OWNER']), reviewController.delete);

export default router;
