import rateLimit from 'express-rate-limit';

/**
 * Limits the number of login/register requests per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

/**
 * Stricter limit for OTP verification
 */
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 OTP attempts per windowMs
  message: { error: 'Too many OTP verification attempts, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
