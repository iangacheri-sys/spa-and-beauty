import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Generic payment CRUD
router.get('/payments', paymentController.getAll);
router.get('/payments/:id', paymentController.getById);
router.post('/payments', requireAuth, paymentController.create);
router.put('/payments/:id', requireAuth, paymentController.update);
router.delete('/payments/:id', requireAuth, paymentController.delete);

// M-Pesa STK Push — initiate payment prompt on customer's phone
router.post('/payments/mpesa/stkpush', requireAuth, paymentController.stkPush);

// M-Pesa STK Query — check status of a pending STK push
router.post('/payments/mpesa/query', requireAuth, paymentController.queryStatus);

// M-Pesa Callback — public endpoint for Safaricom webhook (no auth)
router.post('/payments/mpesa/callback', paymentController.callback);

export default router;
