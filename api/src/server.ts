import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import gameRoutes from './routes/gameRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import shogiRoutes from './routes/shogiRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Simple auth middleware for name-based authentication
app.use((req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userName = req.headers['x-user-name'];
  
  if (userId && userName) {
    req.user = {
      id: userId as string,
      name: userName as string,
    };
  }
  
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'shogi-api',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shogi', shogiRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎯 API Server running on port ${PORT}`);
});

export default app;
