import { z } from 'zod';

// Factory that wraps any ZodString schema with auto-trimming.
// This prevents Railway/Vercel trailing-space mistakes from crashing the server.
const trimmedStr = (schema: z.ZodString = z.string()) =>
  z.preprocess((val) => (typeof val === 'string' ? val.trim() : val), schema);

const trimmedEnum = <T extends [string, ...string[]]>(values: T) =>
  z.preprocess((val) => (typeof val === 'string' ? val.trim() : val), z.enum(values));

const envSchema = z.object({
  NODE_ENV: trimmedEnum(['development', 'production', 'test'] as const).default('development'),
  PORT: trimmedStr().default('5000'),
  DATABASE_URL: trimmedStr(),
  JWT_SECRET: trimmedStr(z.string().min(32, 'JWT_SECRET must be at least 32 characters'))
    .optional()
    .default(process.env.NODE_ENV?.trim() === 'production' ? '' : 'dev-only-secret-key-minimum-32-characters!!')
    .refine((val) => !(process.env.NODE_ENV?.trim() === 'production' && val.length < 32), {
      message: 'JWT_SECRET is required in production and must be at least 32 characters',
    }),
  CORS_ORIGIN: trimmedStr().default('http://localhost:5173,http://localhost:8081'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  GEMINI_API_KEY: trimmedStr().optional(),
  MPESA_CONSUMER_KEY: trimmedStr().optional(),
  MPESA_CONSUMER_SECRET: trimmedStr().optional(),
  MPESA_PASSKEY: trimmedStr().optional(),
  MPESA_SHORTCODE: trimmedStr().optional(),
  MPESA_CALLBACK_URL: trimmedStr().optional(),
  MPESA_ENVIRONMENT: trimmedEnum(['sandbox', 'production'] as const).default('sandbox'),
});

export const env = envSchema.parse(process.env);
