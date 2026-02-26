import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { pollRouter } from './routes/pollRoutes.js';
import { registerPollSocketHandlers } from './sockets/pollSocketHandler.js';

async function main() {
  await connectDatabase();

  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'lecturepoll-backend' });
  });

  app.use('/api/polls', pollRouter);

  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: env.corsOrigin
    }
  });

  registerPollSocketHandlers(io);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

void main();

