import { Router } from 'express';
import { AuthService } from '../services/authService';

const router = Router();
const authService = new AuthService();

// POST /api/auth/validate - Validate name-based authentication
router.post('/validate', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    if (trimmedName.length > 20) {
      return res.status(400).json({ error: 'Name must be 20 characters or less' });
    }

    const user = await authService.validateUser(trimmedName);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET /api/auth/user/:id - Get user profile by ID
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userProfile = await authService.getUserProfile(id);

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
