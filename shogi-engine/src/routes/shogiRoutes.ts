import { Router } from 'express';
import { ShogiEngine } from '../services/shogiEngine';
import { Difficulty } from '../types/shogi';

const router = Router();
const shogiEngine = new ShogiEngine();

// GET /initial-board - Get initial board state
router.get('/initial-board', (req, res) => {
  try {
    const board = shogiEngine.getInitialBoard();
    res.json({ board });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get initial board' });
  }
});

// POST /validate-move - Validate a move
router.post('/validate-move', (req, res) => {
  try {
    const { boardState, move, currentPlayer } = req.body;
    
    if (!boardState || !move || !currentPlayer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isValid = shogiEngine.validateMove(boardState, move, currentPlayer);
    res.json({ isValid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate move' });
  }
});

// POST /make-move - Make a move
router.post('/make-move', (req, res) => {
  try {
    const { boardState, move, currentPlayer } = req.body;
    
    if (!boardState || !move || !currentPlayer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = shogiEngine.makeMove(boardState, move, currentPlayer);
    
    if (result) {
      res.json(result);
    } else {
      res.status(400).json({ error: 'Invalid move' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to make move' });
  }
});

// GET /valid-moves - Get valid moves for a position
router.get('/valid-moves', (req, res) => {
  try {
    const { boardState, position, currentPlayer } = req.query;
    
    if (!boardState || !position || !currentPlayer) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const boardArray = JSON.parse(boardState as string);
    const moves = shogiEngine.getValidMoves(boardArray, position as string, currentPlayer as any);
    
    res.json({ moves });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get valid moves' });
  }
});

// POST /check-game-state - Check game state
router.post('/check-game-state', (req, res) => {
  try {
    const { boardState, currentPlayer } = req.body;
    
    if (!boardState || !currentPlayer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const gameState = shogiEngine.checkGameState(boardState, currentPlayer);
    res.json({ gameState });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check game state' });
  }
});

// POST /ai-move - Get AI move
router.post('/ai-move', async (req, res) => {
  try {
    const { boardState, currentPlayer, difficulty } = req.body;
    
    if (!boardState || !currentPlayer || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const aiMove = await shogiEngine.getAIMove(boardState, currentPlayer, difficulty as Difficulty);
    
    if (aiMove) {
      res.json({ move: aiMove });
    } else {
      res.status(400).json({ error: 'No valid AI move found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get AI move' });
  }
});

// POST /convert-notation - Convert move notation
router.post('/convert-notation', (req, res) => {
  try {
    const { move, fromFormat, toFormat } = req.body;
    
    if (!move || !fromFormat || !toFormat) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const convertedMove = shogiEngine.convertNotation(move, fromFormat, toFormat);
    res.json({ convertedMove });
  } catch (error) {
    res.status(500).json({ error: 'Failed to convert notation' });
  }
});

export default router;