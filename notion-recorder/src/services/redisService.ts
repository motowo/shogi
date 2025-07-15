import { createClient, RedisClientType } from 'redis';

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

  async cacheNotionPage(gameId: string, pageId: string): Promise<void> {
    try {
      await this.client.set(`notion:game:${gameId}`, pageId, {
        EX: 7 * 24 * 60 * 60, // Expire after 7 days
      });
    } catch (error) {
      console.error('Error caching notion page:', error);
    }
  }

  async getCachedNotionPage(gameId: string): Promise<string | null> {
    try {
      return await this.client.get(`notion:game:${gameId}`);
    } catch (error) {
      console.error('Error getting cached notion page:', error);
      return null;
    }
  }

  async cacheGameAnalysis(gameId: string, analysis: object): Promise<void> {
    try {
      await this.client.set(`analysis:${gameId}`, JSON.stringify(analysis), {
        EX: 24 * 60 * 60, // Expire after 24 hours
      });
    } catch (error) {
      console.error('Error caching game analysis:', error);
    }
  }

  async getCachedGameAnalysis(gameId: string): Promise<object | null> {
    try {
      const data = await this.client.get(`analysis:${gameId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached game analysis:', error);
      return null;
    }
  }
}
