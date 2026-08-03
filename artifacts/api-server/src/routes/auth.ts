import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { requireAuth } from '../middlewares/auth';
// Import the rate limiters
import { authLimiter, otpLimiter } from '../middlewares/rate-limit';

const router = Router();

const loginSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  password: z.string().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10).max(15),
  password: z.string().min(6).max(128).optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['PLATFORM_ADMIN', 'SPA_OWNER', 'MANAGER', 'RECEPTIONIST', 'THERAPIST', 'CUSTOMER']).optional(),
  spaId: z.string().uuid('Invalid spaId').optional(),
  referralCode: z.string().optional(),
});

const registerPartnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10).max(15),
  password: z.string().min(6).max(128).optional(),
  email: z.string().email('Invalid email address').optional(),
  spaName: z.string().min(2, 'Spa name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  county: z.string().optional(),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
});

router.post('/login', authLimiter, validate(loginSchema), authController.login.bind(authController));
router.post('/register', authLimiter, validate(registerSchema), authController.register.bind(authController));
router.post('/register-partner', authLimiter, validate(registerPartnerSchema), authController.registerPartner.bind(authController));
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), authController.verifyOtp.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/logout-all', requireAuth, authController.logoutAll.bind(authController));
router.get('/sessions', requireAuth, authController.getSessions.bind(authController));

export default router;
