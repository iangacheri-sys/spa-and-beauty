import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional()
    .default(process.env.NODE_ENV === 'production' ? '' : 'dev-only-secret-key-minimum-32-characters!!')
    .refine((val) => !(process.env.NODE_ENV === 'production' && val.length < 32), {
      message: 'JWT_SECRET is required in production and must be at least 32 characters',
    }),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:8081'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  GEMINI_API_KEY: z.string().optional(),
  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  MPESA_PASSKEY: z.string().optional(),
  MPESA_SHORTCODE: z.string().optional(),
  MPESA_CALLBACK_URL: z.string().optional(),
  MPESA_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
});

export const env = envSchema.parse(process.env);
