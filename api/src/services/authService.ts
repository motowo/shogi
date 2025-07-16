import { auth } from '../config/firebase';
import { FirestoreService, User } from './firestoreService';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: Date;
  lastSeen: Date;
}

export class AuthService {
  private firestoreService: FirestoreService;

  constructor() {
    this.firestoreService = new FirestoreService();
  }

  async verifyIdToken(idToken: string): Promise<any> {
    try {
      return await auth.verifyIdToken(idToken);
    } catch (error) {
      throw new Error('Invalid ID token');
    }
  }

  async createUser(userData: { email: string; password: string; displayName: string }) {
    try {
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });

      // Create user profile in Firestore
      await this.firestoreService.createUser({
        uid: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
      });

      return userRecord;
    } catch (error) {
      console.error('User creation failed:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const user = await this.firestoreService.getUser(uid);
      if (!user) return null;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        rating: user.rating || 1500,
        gamesPlayed: user.gamesPlayed || 0,
        wins: user.wins || 0,
        losses: user.losses || 0,
        draws: user.draws || 0,
        createdAt: user.createdAt,
        lastSeen: user.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const userUpdates: Partial<User> = {
        email: updates.email,
        displayName: updates.displayName,
        rating: updates.rating,
        gamesPlayed: updates.gamesPlayed,
        wins: updates.wins,
        losses: updates.losses,
        draws: updates.draws,
      };

      await this.firestoreService.updateUser(uid, userUpdates);
      return this.getUserProfile(uid);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async deleteUser(uid: string) {
    try {
      await auth.deleteUser(uid);
    } catch (error) {
      console.error('User deletion failed:', error);
      throw error;
    }
  }
}
