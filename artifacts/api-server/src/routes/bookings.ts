import { Router } from 'express';
import { z } from 'zod';
import { bookingController } from '../controllers/booking.controller';
import { requireAuth, requireTenant, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

const createBookingSchema = z.object({
  spaId: z.string().uuid().optional(), // injected by requireTenant if missing
  userId: z.string().uuid(),
  therapistId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, 'timeSlot must be HH:MM'),
  price: z.number().positive('Price must be positive'),
  paymentMethod: z.enum(['MPESA_PAYBILL', 'MPESA_POCHI', 'MPESA_SEND', 'CARD']).optional(),
  depositAmount: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
  policyAcknowledged: z.boolean().optional(),
});

const updateBookingSchema = z.object({
  status: z.enum(['UPCOMING', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  depositPaid: z.boolean().optional(),
  cancellationOutcome: z.string().max(500).optional(),
}).passthrough();

// Public: customers can list bookings by spaId (discovery)
router.get('/', bookingController.getAll);
router.get('/:id', bookingController.getById);

// Protected: must be authenticated + belong to the tenant
router.post('/', requireAuth, requireTenant, validate(createBookingSchema), bookingController.create);
router.put('/:id', requireAuth, requireTenant, validate(updateBookingSchema), bookingController.update);

// Only Spa Owner, Manager, or Platform Admin can cancel/delete bookings
router.delete(
  '/:id',
  requireAuth,
  requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER', 'RECEPTIONIST']),
  bookingController.delete
);

export default router;
