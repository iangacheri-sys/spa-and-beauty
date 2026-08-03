import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);
// router.use(requireTenant); // Allow platform admins to query any spa

router.get('/dashboard', requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), analyticsController.getDashboard);
router.get('/revenue', requireRole(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER']), analyticsController.getRevenueChart);

export default router;
