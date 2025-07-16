export interface SimpleUser {
  id: string;
  name: string;
}

export class AuthService {
  private connectedUsers: Map<string, SimpleUser> = new Map();

  constructor() {
    console.log('AuthService initialized with simple name-based authentication');
  }

  async authenticateUser(userId: string, userName: string): Promise<SimpleUser> {
    // Simple validation
    if (!userId || !userName) {
      throw new Error('User ID and name are required');
    }

    if (userName.trim().length === 0) {
      throw new Error('User name cannot be empty');
    }

    if (userName.trim().length > 20) {
      throw new Error('User name must be 20 characters or less');
    }

    const user: SimpleUser = {
      id: userId,
      name: userName.trim(),
    };

    this.connectedUsers.set(userId, user);
    return user;
  }

  getUserById(userId: string): SimpleUser | undefined {
    return this.connectedUsers.get(userId);
  }

  removeUser(userId: string): void {
    this.connectedUsers.delete(userId);
  }

  getConnectedUsers(): SimpleUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getUserCount(): number {
    return this.connectedUsers.size;
  }
}
