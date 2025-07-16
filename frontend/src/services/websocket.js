import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.isConnected = false;
    this.initializeSocket();
  }

  initializeSocket() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8001';

    this.socket = io(wsUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('connection_error', error);
    });

    // Game events
    this.socket.on('game_joined', (data) => {
      this.emit('game_joined', data);
    });

    this.socket.on('game_updated', (gameState) => {
      this.emit('game_updated', gameState);
    });

    this.socket.on('move_made', (data) => {
      this.emit('move_made', data);
    });

    this.socket.on('game_finished', (data) => {
      this.emit('game_finished', data);
    });

    this.socket.on('player_joined', (data) => {
      this.emit('player_joined', data);
    });

    this.socket.on('player_left', (data) => {
      this.emit('player_left', data);
    });

    this.socket.on('chat_message', (data) => {
      this.emit('chat_message', data);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  connect(token) {
    if (this.socket && !this.isConnected) {
      this.socket.auth = { token };
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
    }
  }

  // Game methods
  joinGame(gameId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_game', gameId);
    }
  }

  leaveGame(gameId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_game', gameId);
    }
  }

  makeMove(gameId, move) {
    if (this.socket && this.isConnected) {
      this.socket.emit('make_move', { gameId, move });
    }
  }

  sendChatMessage(gameId, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat_message', { gameId, message });
    }
  }

  resignGame(gameId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('resign_game', gameId);
    }
  }

  // Event handling
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Status methods
  getConnectionStatus() {
    return this.isConnected;
  }

  // Clean up
  destroy() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners = {};
    this.isConnected = false;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;