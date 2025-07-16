import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Queue from 'bull';

import { GameRecorder } from './recorders/gameRecorder';
import { NotionService } from './services/notionService';
import { RedisService } from './services/redisService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8003;

// Middleware
app.use(cors());
app.use(express.json());

// Services
const notionService = new NotionService();
const redisService = new RedisService();
const gameRecorder = new GameRecorder(notionService);

// Queue setup
const gameRecordingQueue = new Queue('game recording', {
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Queue processor
gameRecordingQueue.process('record_game', async (job) => {
  const { gameData } = job.data;

  console.log(`📝 Processing game recording: ${gameData.gameId}`);

  try {
    const notionPageId = await gameRecorder.recordGame(gameData);

    console.log(`✅ Game recorded successfully: ${gameData.gameId} -> ${notionPageId}`);

    return { success: true, notionPageId };
  } catch (error) {
    console.error(`❌ Failed to record game ${gameData.gameId}:`, error);
    throw error;
  }
});

// Queue processor for analysis
gameRecordingQueue.process('analyze_game', async (job) => {
  const { gameId, moves } = job.data;

  console.log(`🔍 Processing game analysis: ${gameId}`);

  try {
    const analysis = await gameRecorder.analyzeGame(gameId, moves);

    console.log(`✅ Game analyzed successfully: ${gameId}`);

    return { success: true, analysis };
  } catch (error) {
    console.error(`❌ Failed to analyze game ${gameId}:`, error);
    throw error;
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'notion-recorder',
    queue: {
      waiting: await gameRecordingQueue.getWaiting(),
      active: await gameRecordingQueue.getActive(),
      completed: await gameRecordingQueue.getCompleted(),
      failed: await gameRecordingQueue.getFailed(),
    },
  });
});

// API endpoint to trigger game recording
app.post('/api/record-game', async (req, res) => {
  try {
    const { gameData } = req.body;

    if (!gameData || !gameData.gameId) {
      return res.status(400).json({ error: 'Game data with gameId is required' });
    }

    // Add job to queue
    const job = await gameRecordingQueue.add(
      'record_game',
      { gameData },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    res.json({
      success: true,
      jobId: job.id,
      message: 'Game recording queued successfully',
    });
  } catch (error) {
    console.error('Error queuing game recording:', error);
    res.status(500).json({ error: 'Failed to queue game recording' });
  }
});

// API endpoint to trigger game analysis
app.post('/api/analyze-game', async (req, res) => {
  try {
    const { gameId, moves } = req.body;

    if (!gameId || !moves) {
      return res.status(400).json({ error: 'Game ID and moves are required' });
    }

    // Add job to queue
    const job = await gameRecordingQueue.add(
      'analyze_game',
      { gameId, moves },
      {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      }
    );

    res.json({
      success: true,
      jobId: job.id,
      message: 'Game analysis queued successfully',
    });
  } catch (error) {
    console.error('Error queuing game analysis:', error);
    res.status(500).json({ error: 'Failed to queue game analysis' });
  }
});

// API endpoint to get job status
app.get('/api/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await gameRecordingQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress(),
      state: await job.getState(),
      result: job.returnvalue,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notion Recorder Service running on port ${PORT}`);
  console.log(`📝 Queue: ${gameRecordingQueue.name}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down Notion Recorder Service...');

  await gameRecordingQueue.close();
  await redisService.disconnect();

  process.exit(0);
});

export default app;
