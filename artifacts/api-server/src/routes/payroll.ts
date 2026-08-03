import { Router } from 'express';
import { payrollController } from '../controllers/payroll.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Secure all payroll routes
router.use(requireAuth);

router.get('/commissions', payrollController.getCommissions);
router.post('/commissions/pay', payrollController.markAsPaid);
router.get('/summary', payrollController.getSummary);

export default router;
