import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import gameRoutes from './routes/gameRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

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
app.use('/api/games', authMiddleware, gameRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎯 API Server running on port ${PORT}`);
});

export default app;
