import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { ShogiEngine } from './services/shogiEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Services
const shogiEngine = new ShogiEngine();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'shogi-engine',
    version: '1.0.0',
  });
});

// Validate move
app.post('/api/validate-move', (req, res) => {
  try {
    const { board, move, currentPlayer } = req.body;

    if (!board || !move || !currentPlayer) {
      return res.status(400).json({ error: 'Board, move, and currentPlayer are required' });
    }

    const isValid = shogiEngine.validateMove(board, move, currentPlayer);
    const result = isValid ? shogiEngine.makeMove(board, move, currentPlayer) : null;

    res.json({
      valid: isValid,
      result,
      message: isValid ? 'Valid move' : 'Invalid move',
    });
  } catch (error) {
    console.error('Error validating move:', error);
    res.status(500).json({ error: 'Failed to validate move' });
  }
});

// Get valid moves
app.post('/api/valid-moves', (req, res) => {
  try {
    const { board, position, currentPlayer } = req.body;

    if (!board || !position || !currentPlayer) {
      return res.status(400).json({ error: 'Board, position, and currentPlayer are required' });
    }

    const validMoves = shogiEngine.getValidMoves(board, position, currentPlayer);

    res.json({
      position,
      validMoves,
      count: validMoves.length,
    });
  } catch (error) {
    console.error('Error getting valid moves:', error);
    res.status(500).json({ error: 'Failed to get valid moves' });
  }
});

// Check game state
app.post('/api/game-state', (req, res) => {
  try {
    const { board, currentPlayer } = req.body;

    if (!board || !currentPlayer) {
      return res.status(400).json({ error: 'Board and currentPlayer are required' });
    }

    const gameState = shogiEngine.checkGameState(board, currentPlayer);

    res.json(gameState);
  } catch (error) {
    console.error('Error checking game state:', error);
    res.status(500).json({ error: 'Failed to check game state' });
  }
});

// Get AI move
app.post('/api/ai-move', async (req, res) => {
  try {
    const { board, currentPlayer, difficulty } = req.body;

    if (!board || !currentPlayer) {
      return res.status(400).json({ error: 'Board and currentPlayer are required' });
    }

    const aiMove = await shogiEngine.getAIMove(board, currentPlayer, difficulty || 'medium');

    if (!aiMove) {
      return res.status(404).json({ error: 'No valid AI move found' });
    }

    res.json({
      move: aiMove,
      thinking: true,
      difficulty: difficulty || 'medium',
    });
  } catch (error) {
    console.error('Error getting AI move:', error);
    res.status(500).json({ error: 'Failed to get AI move' });
  }
});

// Initialize new game
app.get('/api/new-game', (req, res) => {
  try {
    const initialBoard = shogiEngine.getInitialBoard();

    res.json({
      board: initialBoard,
      currentPlayer: 'sente',
      capturedPieces: {
        sente: [],
        gote: [],
      },
    });
  } catch (error) {
    console.error('Error initializing new game:', error);
    res.status(500).json({ error: 'Failed to initialize new game' });
  }
});

// Convert notation
app.post('/api/convert-notation', (req, res) => {
  try {
    const { move, fromFormat, toFormat } = req.body;

    if (!move || !fromFormat || !toFormat) {
      return res.status(400).json({ error: 'Move, fromFormat, and toFormat are required' });
    }

    const convertedMove = shogiEngine.convertNotation(move, fromFormat, toFormat);

    res.json({
      original: move,
      converted: convertedMove,
      fromFormat,
      toFormat,
    });
  } catch (error) {
    console.error('Error converting notation:', error);
    res.status(500).json({ error: 'Failed to convert notation' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Shogi Engine running on port ${PORT}`);
});

export default app;
