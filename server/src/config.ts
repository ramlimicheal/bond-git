console.log('DEBUG: config.ts loading');
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'node:path';
import process from 'node:process';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
console.log('DEBUG: loading env from', envPath);
dotenv.config({ path: envPath });
console.log('DEBUG: dotenv.config() done');

const configSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Payment Gateway: Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  // Payment Gateway: UPI
  UPI_ID: z.string().optional(),

  // Security
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000').transform(s => s.split(',')),
});

console.log('DEBUG: validating configSchema');
const result = configSchema.safeParse(process.env);
console.log('DEBUG: configSchema.safeParse() done');

if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.format());
  process.exit(1);
}

console.log('DEBUG: config valid, exporting');
export const config = result.data;

export type Config = z.infer<typeof configSchema>;
