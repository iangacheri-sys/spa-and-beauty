import { Router } from 'express';
import { scheduleController } from '../controllers/schedule.controller';
import { requireAuth, requireRole, requireTenant } from '../middlewares/auth';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const setScheduleSchema = z.object({
  body: z.object({
    schedules: z.array(z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
      isWorking: z.boolean().default(true)
    }))
  })
});

const addTimeOffSchema = z.object({
  body: z.object({
    therapistId: z.string().uuid().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    reason: z.string().optional()
  })
});

// All schedule routes require authentication and tenant context
router.use(requireAuth);
router.use(requireTenant);

// Therapist Schedules
router.get('/therapist/:therapistId', scheduleController.getSchedules);
router.put('/therapist/:therapistId', requireRole(['PLATFORM_ADMIN', 'SPA_OWNER']), validate(setScheduleSchema), scheduleController.setSchedule);

// Time Off
router.get('/timeoff', scheduleController.getTimeOff);
router.post('/timeoff', requireRole(['PLATFORM_ADMIN', 'SPA_OWNER']), validate(addTimeOffSchema), scheduleController.addTimeOff);
router.delete('/timeoff/:id', requireRole(['PLATFORM_ADMIN', 'SPA_OWNER']), scheduleController.deleteTimeOff);

export default router;
