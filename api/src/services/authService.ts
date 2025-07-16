export interface UserProfile {
  id: string;
  name: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: Date;
  lastSeen: Date;
}

export class AuthService {
  private users: Map<string, UserProfile> = new Map();

  constructor() {
    // Initialize with some test data
    this.initializeTestData();
  }

  private initializeTestData() {
    // This would be replaced with actual database in production
    const testUsers = [
      { id: 'test1', name: 'テストユーザー1', rating: 1500 },
      { id: 'test2', name: 'テストユーザー2', rating: 1600 },
    ];

    testUsers.forEach((user) => {
      this.users.set(user.id, {
        ...user,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        createdAt: new Date(),
        lastSeen: new Date(),
      });
    });
  }

  async validateUser(name: string): Promise<UserProfile> {
    // In production, this would check against a database
    // For now, we'll create a simple user object
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user: UserProfile = {
      id: userId,
      name,
      rating: 1500,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      createdAt: new Date(),
      lastSeen: new Date(),
    };

    this.users.set(userId, user);
    return user;
  }

  async getUserProfile(id: string): Promise<UserProfile | null> {
    try {
      const user = this.users.get(id);
      if (!user) return null;

      // Update last seen
      user.lastSeen = new Date();
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const user = this.users.get(id);
      if (!user) return null;

      const updatedUser = {
        ...user,
        ...updates,
        lastSeen: new Date(),
      };

      this.users.set(id, updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<UserProfile[]> {
    return Array.from(this.users.values());
  }
}
