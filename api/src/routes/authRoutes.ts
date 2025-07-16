import { Router } from 'express';
import { AuthService } from '../services/authService';

const router = Router();
const authService = new AuthService();

// POST /api/auth/verify - Verify Firebase token
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    const decodedToken = await authService.verifyIdToken(idToken);
    res.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      verified: true,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /api/auth/refresh - Refresh user session
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const result = { token: 'refresh_not_implemented' };
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// GET /api/auth/user/:uid - Get user profile
router.get('/user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const userProfile = await authService.getUserProfile(uid);

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
