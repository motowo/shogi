import { EventEmitter } from 'events';
import { FirestoreService, Game } from './firestoreService';

export interface GameState {
  id: string;
  players: {
    sente: string;
    gote: string;
  };
  currentPlayer: 'sente' | 'gote';
  board: string[][];
  moves: Move[];
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  winner?: string;
  startTime: Date;
  endTime?: Date;
}

export interface Move {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promoted?: boolean;
  timestamp: Date;
}

export interface CreateGameRequest {
  playerId: string;
  gameType: 'ai' | 'human' | 'online';
  timeControl: {
    initial: number;
    increment: number;
  };
}

export class GameService extends EventEmitter {
  private games: Map<string, GameState> = new Map();
  private firestoreService: FirestoreService;

  constructor() {
    super();
    this.firestoreService = new FirestoreService();
  }

  async createGame(senteId: string, goteId: string): Promise<GameState> {
    const gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'> = {
      players: { sente: senteId, gote: goteId },
      moves: [],
      status: 'active',
      startTime: new Date(),
    };

    const gameId = await this.firestoreService.createGame(gameData);

    const game: GameState = {
      id: gameId,
      players: { sente: senteId, gote: goteId },
      currentPlayer: 'sente',
      board: this.getInitialBoard(),
      moves: [],
      status: 'active',
      startTime: new Date(),
    };

    this.games.set(gameId, game);
    this.emit('game:created', game);
    return game;
  }

  async getGame(gameId: string): Promise<GameState | null> {
    // Check memory first
    const memoryGame = this.games.get(gameId);
    if (memoryGame) return memoryGame;

    // Check Firestore
    const dbGame = await this.firestoreService.getGame(gameId);
    if (dbGame) {
      const game: GameState = {
        id: dbGame.id!,
        players: dbGame.players,
        currentPlayer: dbGame.moves.length % 2 === 0 ? 'sente' : 'gote',
        board: this.getInitialBoard(), // TODO: Reconstruct board from moves
        moves: dbGame.moves,
        status: dbGame.status,
        winner: dbGame.result?.winner,
        startTime: dbGame.startTime,
        endTime: dbGame.endTime,
      };
      this.games.set(gameId, game);
      return game;
    }

    return null;
  }

  async makeMove(gameId: string, playerId: string, move: Move): Promise<boolean> {
    const game = await this.getGame(gameId);
    if (!game) return false;

    // Validate that it's the player's turn
    if (game.players[game.currentPlayer] !== playerId) {
      return false;
    }

    // Basic move validation (simplified)
    if (this.isValidMove(game, move)) {
      game.moves.push(move);
      this.updateBoard(game, move);

      // Switch turns
      game.currentPlayer = game.currentPlayer === 'sente' ? 'gote' : 'sente';

      // Check for game end conditions
      if (this.isGameFinished(game)) {
        game.status = 'finished';
        game.endTime = new Date();

        // Update game in Firestore
        await this.firestoreService.updateGame(gameId, {
          moves: game.moves,
          status: 'finished',
          endTime: game.endTime,
          result: {
            winner: game.winner || 'draw',
            reason: 'game_end',
          },
        });

        this.emit('game:finished', game);
      } else {
        // Update moves in Firestore
        await this.firestoreService.updateGame(gameId, {
          moves: game.moves,
        });
      }

      this.emit('game:move', { gameId, move, game });
      return true;
    }

    return false;
  }

  getAllGames(): GameState[] {
    return Array.from(this.games.values());
  }

  async getPlayerGames(playerId: string): Promise<GameState[]> {
    const dbGames = await this.firestoreService.getUserGames(playerId);
    return dbGames.map((dbGame) => ({
      id: dbGame.id!,
      players: dbGame.players,
      currentPlayer: dbGame.moves.length % 2 === 0 ? 'sente' : 'gote',
      board: this.getInitialBoard(),
      moves: dbGame.moves,
      status: dbGame.status,
      winner: dbGame.result?.winner,
      startTime: dbGame.startTime,
      endTime: dbGame.endTime,
    }));
  }

  private getInitialBoard(): string[][] {
    // Standard shogi initial board setup
    return [
      ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l'],
      ['', 'r', '', '', '', '', '', 'b', ''],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['', 'B', '', '', '', '', '', 'R', ''],
      ['L', 'N', 'S', 'G', 'K', 'G', 'S', 'N', 'L'],
    ];
  }

  private isValidMove(game: GameState, move: Move): boolean {
    // Simplified move validation
    // In a real implementation, this would be much more complex
    return move.from !== move.to;
  }

  private updateBoard(game: GameState, move: Move): void {
    // Simplified board update
    // In a real implementation, this would handle piece movement,
    // captures, promotions, etc.
    const fromPos = this.parsePosition(move.from);
    const toPos = this.parsePosition(move.to);

    if (fromPos && toPos) {
      const piece = game.board[fromPos.row][fromPos.col];
      game.board[fromPos.row][fromPos.col] = '';
      game.board[toPos.row][toPos.col] = piece;
    }
  }

  private parsePosition(pos: string): { row: number; col: number } | null {
    // Parse position strings like "1a", "5e", etc.
    const match = pos.match(/^([1-9])([a-i])$/);
    if (!match) return null;

    const col = parseInt(match[1]) - 1;
    const row = match[2].charCodeAt(0) - 'a'.charCodeAt(0);

    return { row, col };
  }

  private isGameFinished(game: GameState): boolean {
    // Simplified game end detection
    // In a real implementation, this would check for checkmate, stalemate, etc.
    return game.moves.length > 100; // Arbitrary limit for demo
  }
}
