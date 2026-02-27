import dotenv from 'dotenv';

dotenv.config();

const fallbackUri = 'mongodb://127.0.0.1:27017/lecturepoll';

const mongoUri = process.env.MONGODB_URI ?? fallbackUri;

// 🔍 Debug log
if (process.env.MONGODB_URI) {
  console.log("Using Atlas/Custom Mongo URI");
} else {
  console.log("Using Local MongoDB URI");
}

console.log("Mongo URI:", mongoUri);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri,
  corsOrigin: process.env.CORS_ORIGIN ?? '*'
} as const;