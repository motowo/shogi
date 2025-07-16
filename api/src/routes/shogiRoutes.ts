import { Router } from 'express';
import axios from 'axios';

const router = Router();
const SHOGI_ENGINE_URL = process.env.SHOGI_ENGINE_URL || 'http://shogi-engine:8002';

// GET /api/shogi/initial-board - Get initial board state
router.get('/initial-board', async (req, res) => {
  try {
    const response = await axios.get(`${SHOGI_ENGINE_URL}/initial-board`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get initial board' });
  }
});

// POST /api/shogi/validate-move - Validate a move
router.post('/validate-move', async (req, res) => {
  try {
    const { boardState, move, currentPlayer } = req.body;
    
    if (!boardState || !move || !currentPlayer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await axios.post(`${SHOGI_ENGINE_URL}/validate-move`, {
      boardState,
      move,
      currentPlayer
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate move' });
  }
});

// POST /api/shogi/make-move - Make a move
router.post('/make-move', async (req, res) => {
  try {
    const { boardState, move, currentPlayer } = req.body;
    
    if (!boardState || !move || !currentPlayer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await axios.post(`${SHOGI_ENGINE_URL}/make-move`, {
      boardState,
      move,
      currentPlayer
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to make move' });
  }
});

// GET /api/shogi/valid-moves - Get valid moves for a position
router.get('/valid-moves', async (req, res) => {
  try {
    const { boardState, position, currentPlayer } = req.query;
    
    if (!boardState || !position || !currentPlayer) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await axios.get(`${SHOGI_ENGINE_URL}/valid-moves`, {
      params: { boardState, position, currentPlayer }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get valid moves' });
  }
});

// POST /api/shogi/check-game-state - Check game state
router.post('/check-game-state', async (req, res) => {
  try {
    const { boardState, currentPlayer } = req.body;
    
    if (!boardState || !currentPlayer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await axios.post(`${SHOGI_ENGINE_URL}/check-game-state`, {
      boardState,
      currentPlayer
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check game state' });
  }
});

// POST /api/shogi/ai-move - Get AI move
router.post('/ai-move', async (req, res) => {
  try {
    const { boardState, currentPlayer, difficulty } = req.body;
    
    if (!boardState || !currentPlayer || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await axios.post(`${SHOGI_ENGINE_URL}/ai-move`, {
      boardState,
      currentPlayer,
      difficulty
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get AI move' });
  }
});

// POST /api/shogi/convert-notation - Convert move notation
router.post('/convert-notation', async (req, res) => {
  try {
    const { move, fromFormat, toFormat } = req.body;
    
    if (!move || !fromFormat || !toFormat) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await axios.post(`${SHOGI_ENGINE_URL}/convert-notation`, {
      move,
      fromFormat,
      toFormat
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to convert notation' });
  }
});

export default router;