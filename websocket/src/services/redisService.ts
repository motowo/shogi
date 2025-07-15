import { createClient, RedisClientType } from 'redis';
import { GameState } from '../types/game';

export class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    this.client.on('connect', () => {
      console.log('📡 Connected to Redis');
    });

    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }

  async disconnect() {
    try {
      await this.client.disconnect();
      console.log('📡 Disconnected from Redis');
    } catch (error) {
      console.error('Failed to disconnect from Redis:', error);
    }
  }

  async getGameState(gameId: string): Promise<GameState | null> {
    try {
      const data = await this.client.get(`game:${gameId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting game state:', error);
      return null;
    }
  }

  async saveGameState(gameId: string, gameState: GameState): Promise<void> {
    try {
      await this.client.set(`game:${gameId}`, JSON.stringify(gameState), {
        EX: 24 * 60 * 60, // Expire after 24 hours
      });
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }

  async deleteGameState(gameId: string): Promise<void> {
    try {
      await this.client.del(`game:${gameId}`);
    } catch (error) {
      console.error('Error deleting game state:', error);
    }
  }

  async setUserSession(userId: string, sessionData: object): Promise<void> {
    try {
      await this.client.set(`session:${userId}`, JSON.stringify(sessionData), {
        EX: 60 * 60, // Expire after 1 hour
      });
    } catch (error) {
      console.error('Error setting user session:', error);
    }
  }

  async getUserSession(userId: string): Promise<object | null> {
    try {
      const data = await this.client.get(`session:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  }

  async deleteUserSession(userId: string): Promise<void> {
    try {
      await this.client.del(`session:${userId}`);
    } catch (error) {
      console.error('Error deleting user session:', error);
    }
  }

  async publishGameUpdate(gameId: string, update: object): Promise<void> {
    try {
      await this.client.publish(`game:${gameId}:updates`, JSON.stringify(update));
    } catch (error) {
      console.error('Error publishing game update:', error);
    }
  }

  async subscribeToGameUpdates(gameId: string, callback: (update: object) => void): Promise<void> {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.connect();

      await subscriber.subscribe(`game:${gameId}:updates`, (message) => {
        try {
          const update = JSON.parse(message);
          callback(update);
        } catch (error) {
          console.error('Error parsing game update:', error);
        }
      });
    } catch (error) {
      console.error('Error subscribing to game updates:', error);
    }
  }
}
