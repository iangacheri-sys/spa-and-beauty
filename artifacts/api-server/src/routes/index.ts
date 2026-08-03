import { Router } from 'express';
import servicesRouter from './services';
import classesRouter from './classes';
import productsRouter from './products';
import authRouter from './auth';
import spasRouter from './spas';
import bookingsRouter from './bookings';
import therapistsRouter from './therapists';
import paymentRouter from './payment';
import messagesRouter from './messages';
import usersRouter from './users';
import healthRouter from './health';
import ordersRouter from './orders';
import reviewsRouter from './reviews';
import analyticsRouter from './analytics';
import aiRouter from './ai';
import loyaltyRouter from './loyalty';
import walletRouter from './wallet';
import inventoryRouter from './inventory';
import searchRouter from './search';
import notificationsRoutes from './notifications';
import scheduleRoutes from './schedule';
import payrollRoutes from './payroll';
import paymentSettingsRoutes from './payment-settings';

const router = Router();

router.use('/health', healthRouter);

router.use('/auth', authRouter);
router.use('/spas', spasRouter);
router.use('/services', servicesRouter);
router.use('/classes', classesRouter);
router.use('/products', productsRouter);
router.use('/bookings', bookingsRouter);
router.use('/therapists', therapistsRouter);
router.use('/users', usersRouter);
router.use('/messages', messagesRouter);
router.use('/reviews', reviewsRouter);
router.use('/analytics', analyticsRouter);
router.use('/ai', aiRouter);
router.use('/loyalty', loyaltyRouter);
router.use('/wallet', walletRouter);
router.use('/inventory', inventoryRouter);
router.use('/search', searchRouter);
router.use('/notifications', notificationsRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/payroll', payrollRoutes);
router.use('/settings/payment', paymentSettingsRoutes);
router.use('/', paymentRouter); // Mounts /payments/mpesa/stkpush etc.
router.use('/orders', ordersRouter);

export default router;
