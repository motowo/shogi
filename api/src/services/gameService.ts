export interface Game {
  id: string;
  playerId: string;
  opponentId?: string;
  gameType: 'ai' | 'human' | 'online';
  timeControl: {
    initial: number; // minutes
    increment: number; // seconds
  };
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  moves: Move[];
  result?: 'win' | 'lose' | 'draw';
  createdAt: Date;
  updatedAt: Date;
}

export interface Move {
  notation: string;
  timestamp: Date;
  timeLeft: number;
  player: 'sente' | 'gote';
}

export interface CreateGameRequest {
  playerId: string;
  gameType: 'ai' | 'human' | 'online';
  timeControl: {
    initial: number;
    increment: number;
  };
}

export class GameService {
  private games: Map<string, Game> = new Map();

  async createGame(request: CreateGameRequest): Promise<Game> {
    const gameId = this.generateGameId();

    const game: Game = {
      id: gameId,
      playerId: request.playerId,
      gameType: request.gameType,
      timeControl: request.timeControl,
      status: request.gameType === 'ai' ? 'active' : 'waiting',
      moves: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.games.set(gameId, game);
    return game;
  }

  async getGame(gameId: string): Promise<Game | null> {
    return this.games.get(gameId) || null;
  }

  async getUserGames(userId: string): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter((game) => game.playerId === userId || game.opponentId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async makeMove(
    gameId: string,
    userId: string,
    move: string
  ): Promise<{ success: boolean; game: Game }> {
    const game = this.games.get(gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    if (game.playerId !== userId && game.opponentId !== userId) {
      throw new Error('User is not part of this game');
    }

    const moveCount = game.moves.length;
    const isPlayerTurn =
      (moveCount % 2 === 0 && game.playerId === userId) ||
      (moveCount % 2 === 1 && game.opponentId === userId);

    if (!isPlayerTurn) {
      throw new Error('Not your turn');
    }

    const newMove: Move = {
      notation: move,
      timestamp: new Date(),
      timeLeft: 600, // TODO: Calculate actual time left
      player: moveCount % 2 === 0 ? 'sente' : 'gote',
    };

    game.moves.push(newMove);
    game.updatedAt = new Date();

    this.games.set(gameId, game);

    return { success: true, game };
  }

  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
