import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import shogiRoutes from './routes/shogiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

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
    service: 'shogi-engine',
    version: '1.0.0',
  });
});

// Routes
app.use('/', shogiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Shogi Engine running on port ${PORT}`);
});

export default app;
