import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/lecturepoll',
  corsOrigin: process.env.CORS_ORIGIN ?? '*'
} as const;

