import { Server, Socket } from 'socket.io';
import { RedisService } from '../services/redisService';
import { GameRoom, GameMove, GameState } from '../types/game';

export class GameHandler {
  private io: Server;
  private redis: RedisService;
  private activeRooms: Map<string, GameRoom> = new Map();

  constructor(io: Server, redisService: RedisService) {
    this.io = io;
    this.redis = redisService;
  }

  handleConnection(socket: Socket) {
    // Join game room
    socket.on('join_game', async (gameId: string) => {
      await this.handleJoinGame(socket, gameId);
    });

    // Leave game room
    socket.on('leave_game', async (gameId: string) => {
      await this.handleLeaveGame(socket, gameId);
    });

    // Make a move
    socket.on('make_move', async (data: { gameId: string; move: GameMove }) => {
      await this.handleMakeMove(socket, data);
    });

    // Request game state
    socket.on('get_game_state', async (gameId: string) => {
      await this.handleGetGameState(socket, gameId);
    });

    // Offer draw
    socket.on('offer_draw', async (gameId: string) => {
      await this.handleOfferDraw(socket, gameId);
    });

    // Resign game
    socket.on('resign_game', async (gameId: string) => {
      await this.handleResignGame(socket, gameId);
    });

    // Send message/chat
    socket.on('send_message', async (data: { gameId: string; message: string }) => {
      await this.handleSendMessage(socket, data);
    });
  }

  handleDisconnection(socket: Socket) {
    // Clean up user from all game rooms
    this.activeRooms.forEach((room, gameId) => {
      if (room.players.includes(socket.userId)) {
        this.handlePlayerDisconnect(gameId, socket.userId);
      }
    });
  }

  private async handleJoinGame(socket: Socket, gameId: string) {
    try {
      // Get or create game room
      let room = this.activeRooms.get(gameId);

      if (!room) {
        // Load game state from Redis
        const gameState = await this.redis.getGameState(gameId);

        if (!gameState) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        room = {
          id: gameId,
          players: [],
          spectators: [],
          gameState,
          lastActivity: new Date(),
        };

        this.activeRooms.set(gameId, room);
      }

      // Add player to room
      socket.join(gameId);

      if (!room.players.includes(socket.userId)) {
        if (room.players.length < 2) {
          room.players.push(socket.userId);
        } else {
          room.spectators.push(socket.userId);
        }
      }

      room.lastActivity = new Date();

      // Notify all participants
      this.io.to(gameId).emit('player_joined', {
        userId: socket.userId,
        players: room.players,
        spectators: room.spectators,
      });

      // Send current game state to the joining player
      socket.emit('game_state', room.gameState);

      console.log(`🎮 Player ${socket.userId} joined game ${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  }

  private async handleLeaveGame(socket: Socket, gameId: string) {
    try {
      const room = this.activeRooms.get(gameId);

      if (!room) {
        return;
      }

      socket.leave(gameId);

      // Remove player from room
      room.players = room.players.filter((id) => id !== socket.userId);
      room.spectators = room.spectators.filter((id) => id !== socket.userId);

      // Notify remaining participants
      this.io.to(gameId).emit('player_left', {
        userId: socket.userId,
        players: room.players,
        spectators: room.spectators,
      });

      // Clean up empty rooms
      if (room.players.length === 0 && room.spectators.length === 0) {
        this.activeRooms.delete(gameId);
      }

      console.log(`👋 Player ${socket.userId} left game ${gameId}`);
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  }

  private async handleMakeMove(socket: Socket, data: { gameId: string; move: GameMove }) {
    try {
      const { gameId, move } = data;
      const room = this.activeRooms.get(gameId);

      if (!room) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Validate move
      if (!this.validateMove(room, socket.userId, move)) {
        socket.emit('error', { message: 'Invalid move' });
        return;
      }

      // Update game state
      room.gameState.moves.push(move);
      room.gameState.currentPlayer = room.gameState.currentPlayer === 'sente' ? 'gote' : 'sente';
      room.gameState.updatedAt = new Date().toISOString();
      room.lastActivity = new Date();

      // Save to Redis
      await this.redis.saveGameState(gameId, room.gameState);

      // Broadcast move to all participants
      this.io.to(gameId).emit('move_made', {
        move,
        gameState: room.gameState,
      });

      console.log(`♟️ Move made in game ${gameId}: ${move.notation}`);
    } catch (error) {
      console.error('Error making move:', error);
      socket.emit('error', { message: 'Failed to make move' });
    }
  }

  private async handleGetGameState(socket: Socket, gameId: string) {
    try {
      const room = this.activeRooms.get(gameId);

      if (room) {
        socket.emit('game_state', room.gameState);
      } else {
        // Try to load from Redis
        const gameState = await this.redis.getGameState(gameId);

        if (gameState) {
          socket.emit('game_state', gameState);
        } else {
          socket.emit('error', { message: 'Game not found' });
        }
      }
    } catch (error) {
      console.error('Error getting game state:', error);
      socket.emit('error', { message: 'Failed to get game state' });
    }
  }

  private async handleOfferDraw(socket: Socket, gameId: string) {
    try {
      const room = this.activeRooms.get(gameId);

      if (!room) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Notify the opponent
      this.io.to(gameId).emit('draw_offered', {
        offeredBy: socket.userId,
      });

      console.log(`🤝 Draw offered in game ${gameId} by ${socket.userId}`);
    } catch (error) {
      console.error('Error offering draw:', error);
      socket.emit('error', { message: 'Failed to offer draw' });
    }
  }

  private async handleResignGame(socket: Socket, gameId: string) {
    try {
      const room = this.activeRooms.get(gameId);

      if (!room) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Update game state
      room.gameState.status = 'completed';
      room.gameState.result = {
        winner: room.players.find((id) => id !== socket.userId),
        reason: 'resignation',
        resignedBy: socket.userId,
        timestamp: new Date().toISOString(),
      };
      room.gameState.updatedAt = new Date().toISOString();

      // Save to Redis
      await this.redis.saveGameState(gameId, room.gameState);

      // Notify all participants
      this.io.to(gameId).emit('game_ended', {
        result: room.gameState.result,
        gameState: room.gameState,
      });

      console.log(`🏳️ Game ${gameId} resigned by ${socket.userId}`);
    } catch (error) {
      console.error('Error resigning game:', error);
      socket.emit('error', { message: 'Failed to resign game' });
    }
  }

  private async handleSendMessage(socket: Socket, data: { gameId: string; message: string }) {
    try {
      const { gameId, message } = data;
      const room = this.activeRooms.get(gameId);

      if (!room) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Broadcast message to all participants
      this.io.to(gameId).emit('message_received', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        message,
        timestamp: new Date().toISOString(),
      });

      console.log(`💬 Message in game ${gameId} from ${socket.userId}: ${message}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private validateMove(room: GameRoom, userId: string, move: GameMove): boolean {
    // Basic validation
    if (room.gameState.status !== 'active') {
      return false;
    }

    // Check if it's the player's turn
    const playerIndex = room.players.indexOf(userId);
    const currentPlayerIndex = room.gameState.currentPlayer === 'sente' ? 0 : 1;

    if (playerIndex !== currentPlayerIndex) {
      return false;
    }

    // Additional move validation logic would go here
    return true;
  }

  private async handlePlayerDisconnect(gameId: string, userId: string) {
    try {
      const room = this.activeRooms.get(gameId);

      if (!room) {
        return;
      }

      // Notify remaining participants
      this.io.to(gameId).emit('player_disconnected', {
        userId,
        timestamp: new Date().toISOString(),
      });

      // If it's an active game, pause the timer
      if (room.gameState.status === 'active') {
        room.gameState.pausedAt = new Date().toISOString();
        await this.redis.saveGameState(gameId, room.gameState);
      }

      console.log(`🔌 Player ${userId} disconnected from game ${gameId}`);
    } catch (error) {
      console.error('Error handling player disconnect:', error);
    }
  }
}
