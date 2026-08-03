import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Checkout a cart
router.post('/checkout', requireAuth, orderController.checkout);

// Get my orders
router.get('/my', requireAuth, orderController.getMyOrders);

export default router;
