import { Router } from 'express';
import { AuthService } from '../services/authService';
import { FirestoreService } from '../services/firestoreService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const authService = new AuthService();
const firestoreService = new FirestoreService();

router.use(authMiddleware);

// GET /api/users/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.uid;
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
    const userId = req.user?.uid;
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
    const leaderboard = await firestoreService.getLeaderboard(limit);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// POST /api/users/stats - Update user stats after game
router.post('/stats', async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { gameResult } = req.body;

    await firestoreService.updateUserStats(userId, gameResult);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

export default router;
