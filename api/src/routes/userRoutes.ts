import { Router } from 'express';
import { AuthService } from '../services/authService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const authService = new AuthService();

router.use(authMiddleware);

// GET /api/users/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.id;
    const profile = await authService.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user?.id;
    const updates = req.body;

    const profile = await authService.updateUserProfile(userId, updates);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/leaderboard - Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const users = await authService.getAllUsers();
    
    // Sort by rating and limit results
    const leaderboard = users
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
      .map(user => ({
        id: user.id,
        name: user.name,
        rating: user.rating,
        gamesPlayed: user.gamesPlayed,
        wins: user.wins,
        losses: user.losses,
      }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// POST /api/users/stats - Update user stats after game
router.post('/stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { gameResult } = req.body;

    const currentUser = await authService.getUserProfile(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user stats based on game result
    const updates = {
      gamesPlayed: currentUser.gamesPlayed + 1,
      wins: currentUser.wins + (gameResult === 'win' ? 1 : 0),
      losses: currentUser.losses + (gameResult === 'loss' ? 1 : 0),
      draws: currentUser.draws + (gameResult === 'draw' ? 1 : 0),
    };

    await authService.updateUserProfile(userId, updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

export default router;
