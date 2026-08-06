import { z } from 'zod';

// Preprocessor that trims whitespace from string env vars.
// This prevents Railway/Vercel "trailing space" mistakes from crashing the server.
const trimmedString = z.preprocess((val) => {
  if (typeof val === 'string') return val.trim();
  return val;
}, z.string());

const trimmedEnum = <T extends [string, ...string[]]>(values: T) =>
  z.preprocess((val) => {
    if (typeof val === 'string') return val.trim();
    return val;
  }, z.enum(values));

const envSchema = z.object({
  NODE_ENV: trimmedEnum(['development', 'production', 'test'] as const).default('development'),
  PORT: trimmedString.default('5000'),
  DATABASE_URL: trimmedString,
  JWT_SECRET: trimmedString.min(32, 'JWT_SECRET must be at least 32 characters').optional()
    .default(process.env.NODE_ENV?.trim() === 'production' ? '' : 'dev-only-secret-key-minimum-32-characters!!')
    .refine((val) => !(process.env.NODE_ENV?.trim() === 'production' && val.length < 32), {
      message: 'JWT_SECRET is required in production and must be at least 32 characters',
    }),
  CORS_ORIGIN: trimmedString.default('http://localhost:5173,http://localhost:8081'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  GEMINI_API_KEY: trimmedString.optional(),
  MPESA_CONSUMER_KEY: trimmedString.optional(),
  MPESA_CONSUMER_SECRET: trimmedString.optional(),
  MPESA_PASSKEY: trimmedString.optional(),
  MPESA_SHORTCODE: trimmedString.optional(),
  MPESA_CALLBACK_URL: trimmedString.optional(),
  MPESA_ENVIRONMENT: trimmedEnum(['sandbox', 'production'] as const).default('sandbox'),
});

export const env = envSchema.parse(process.env);

