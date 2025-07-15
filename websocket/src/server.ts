import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

import { GameHandler } from './handlers/gameHandler';
import { AuthService } from './services/authService';
import { RedisService } from './services/redisService';

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8001;

// Services
const authService = new AuthService();
const redisService = new RedisService();
const gameHandler = new GameHandler(io, redisService);

// Middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decodedToken = await authService.verifyIdToken(token);
    socket.userId = decodedToken.uid;
    socket.userEmail = decodedToken.email;

    console.log(`🔐 User authenticated: ${decodedToken.uid}`);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next(new Error('Authentication failed'));
  }
});

// Connection handling
io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.userId}`);

  // Game-related events
  gameHandler.handleConnection(socket);

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User disconnected: ${socket.userId}, reason: ${reason}`);
    gameHandler.handleDisconnection(socket);
  });

  // Health check
  socket.on('ping', () => {
    socket.emit('pong', {
      timestamp: new Date().toISOString(),
      userId: socket.userId,
    });
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down WebSocket server...');
  httpServer.close(() => {
    redisService.disconnect();
    process.exit(0);
  });
});

export default io;
