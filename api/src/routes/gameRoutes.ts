import { Router } from 'express';
import { GameService } from '../services/gameService';

const router = Router();
const gameService = new GameService();

// GET /api/games - Get user's games
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.uid;
    const games = await gameService.getUserGames(userId);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// POST /api/games - Create new game
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { gameType, timeControl } = req.body;

    const game = await gameService.createGame({
      playerId: userId,
      gameType,
      timeControl,
    });

    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// GET /api/games/:gameId - Get specific game
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await gameService.getGame(gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// POST /api/games/:gameId/moves - Make a move
router.post('/:gameId/moves', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { move } = req.body;
    const userId = req.user?.uid;

    const result = await gameService.makeMove(gameId, userId, move);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to make move' });
  }
});

export default router;
