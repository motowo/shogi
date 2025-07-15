import admin from 'firebase-admin';

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
}
