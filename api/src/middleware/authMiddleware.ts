import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const userName = req.headers['x-user-name'] as string;

    // For development/testing: create default user if headers are missing
    if (!userId || !userName) {
      req.user = {
        id: 'test-user-' + Date.now(),
        name: 'Test User',
      };
      return next();
    }

    // Validate user with auth service
    try {
      let user = await authService.getUserProfile(userId);
      if (!user) {
        // Create user if not exists (for development)
        user = await authService.validateUser(userName);
      }
    } catch (error) {
      // Continue with default user for testing
      console.log('Auth service error, using test user:', error);
    }

    req.user = {
      id: userId,
      name: userName,
    };

    next();
  } catch (error) {
    // Fallback to test user for development
    req.user = {
      id: 'test-user-fallback',
      name: 'Test User',
    };
    next();
  }
};
