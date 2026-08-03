import { Router } from 'express';
import { paymentSettingsController } from '../controllers/payment-settings.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Private routes for Spa Admin
router.get('/', requireAuth, paymentSettingsController.getSettings);
router.put('/', requireAuth, paymentSettingsController.updateSettings);

// Public route for Mobile App Checkout
router.get('/:spaId/public', paymentSettingsController.getPublicSettings);

export default router;
