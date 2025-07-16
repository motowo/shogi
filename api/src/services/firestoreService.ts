import { db } from '../config/firebase';

export interface Game {
  id?: string;
  players: {
    sente: string;
    gote: string;
  };
  moves: any[];
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  result?: {
    winner: string;
    reason: string;
  };
  startTime: Date;
  endTime?: Date;
  notionPageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  rating?: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class FirestoreService {
  private gamesCollection = 'games';
  private usersCollection = 'users';

  async createGame(gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await db.collection(this.gamesCollection).add({
      ...gameData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async getGame(gameId: string): Promise<Game | null> {
    const docRef = db.collection(this.gamesCollection).doc(gameId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as Game;
    }
    return null;
  }

  async updateGame(gameId: string, updates: Partial<Game>): Promise<void> {
    const docRef = db.collection(this.gamesCollection).doc(gameId);
    await docRef.update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteGame(gameId: string): Promise<void> {
    const docRef = db.collection(this.gamesCollection).doc(gameId);
    await docRef.delete();
  }

  async getUserGames(userId: string, limitCount: number = 10): Promise<Game[]> {
    const querySnapshot = await db
      .collection(this.gamesCollection)
      .where('players.sente', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    const games: Game[] = [];

    querySnapshot.forEach((doc) => {
      games.push({ id: doc.id, ...doc.data() } as Game);
    });

    return games;
  }

  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<void> {
    const docRef = db.collection(this.usersCollection).doc(userData.uid);
    await docRef.set({
      ...userData,
      rating: userData.rating || 1500,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async getUser(uid: string): Promise<User | null> {
    const docRef = db.collection(this.usersCollection).doc(uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data() as User;
    }
    return null;
  }

  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    const docRef = db.collection(this.usersCollection).doc(uid);
    await docRef.update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async updateUserStats(uid: string, gameResult: 'win' | 'loss' | 'draw'): Promise<void> {
    const user = await this.getUser(uid);
    if (!user) return;

    const updates: Partial<User> = {
      gamesPlayed: (user.gamesPlayed || 0) + 1,
      wins: user.wins || 0,
      losses: user.losses || 0,
      draws: user.draws || 0,
    };

    switch (gameResult) {
      case 'win':
        updates.wins = (user.wins || 0) + 1;
        updates.rating = (user.rating || 1500) + 20;
        break;
      case 'loss':
        updates.losses = (user.losses || 0) + 1;
        updates.rating = Math.max(1000, (user.rating || 1500) - 20);
        break;
      case 'draw':
        updates.draws = (user.draws || 0) + 1;
        break;
    }

    await this.updateUser(uid, updates);
  }

  async getLeaderboard(limitCount: number = 10): Promise<User[]> {
    const querySnapshot = await db
      .collection(this.usersCollection)
      .orderBy('rating', 'desc')
      .limit(limitCount)
      .get();

    const users: User[] = [];

    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });

    return users;
  }
}
