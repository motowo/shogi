import admin from 'firebase-admin';

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
  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (!admin.apps.length) {
      try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccount) {
          const serviceAccountObj = JSON.parse(serviceAccount);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountObj),
          });
        } else {
          // For development, use default credentials
          admin.initializeApp();
        }
      } catch (error) {
        console.warn('Firebase initialization skipped:', error.message);
      }
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      throw new Error('Invalid ID token');
    }
  }

  async refreshUserSession(refreshToken: string): Promise<{ accessToken: string }> {
    // Note: Firebase Admin SDK doesn't support refresh tokens directly
    // This would typically be handled by the client SDK
    throw new Error('Refresh token handling not implemented');
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRecord = await admin.auth().getUser(uid);

      // In a real implementation, this would fetch from Firestore
      const profile: UserProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || 'Anonymous',
        rating: 1200, // Default rating
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        createdAt: new Date(userRecord.metadata.creationTime),
        lastSeen: new Date(),
      };

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    // In a real implementation, this would update Firestore
    console.log('Update user profile:', uid, updates);
    return this.getUserProfile(uid);
  }
}
