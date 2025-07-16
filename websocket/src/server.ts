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
    const userId = socket.handshake.auth.userId;
    const userName = socket.handshake.auth.userName;

    if (!userId || !userName) {
      return next(new Error('User ID and name are required'));
    }

    const user = await authService.authenticateUser(userId, userName);
    socket.userId = user.id;
    socket.userName = user.name;

    console.log(`🔐 User authenticated: ${user.id} (${user.name})`);
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
    
    // Remove user from auth service
    if (socket.userId) {
      authService.removeUser(socket.userId);
    }
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
