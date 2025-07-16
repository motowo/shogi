export interface GameMove {
  notation: string; // 将棋記法 (e.g., "▲7六歩")
  from?: string; // 移動元 (e.g., "77")
  to: string; // 移動先 (e.g., "76")
  piece: string; // 駒の種類 (e.g., "歩")
  captured?: string; // 取った駒
  promoted?: boolean; // 成り
  timestamp: string;
  timeLeft: number; // 残り時間（秒）
  player: 'sente' | 'gote';
}

export interface GameResult {
  winner?: string; // プレイヤーID
  reason: 'checkmate' | 'resignation' | 'draw' | 'timeout' | 'abandonment';
  resignedBy?: string;
  timestamp: string;
}

export interface GameState {
  id: string;
  players: {
    sente: string; // プレイヤーID
    gote: string; // プレイヤーID
  };
  status: 'waiting' | 'active' | 'paused' | 'completed';
  currentPlayer: 'sente' | 'gote';
  moves: GameMove[];
  board: string[][]; // 9x9の盤面 (空="", 駒="歩"など)
  capturedPieces: {
    sente: string[];
    gote: string[];
  };
  timeControl: {
    initial: number; // 初期時間（秒）
    increment: number; // 増加時間（秒）
    sente: number; // 先手残り時間
    gote: number; // 後手残り時間
  };
  result?: GameResult;
  createdAt: string;
  updatedAt: string;
  pausedAt?: string;
}

export interface GameRoom {
  id: string;
  players: string[]; // プレイヤーID配列
  spectators: string[]; // 観戦者ID配列
  gameState: GameState;
  lastActivity: Date;
}

export interface ChatMessage {
  userId: string;
  userEmail?: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'system';
}

// Socket.io の拡張型定義
declare module 'socket.io' {
  interface Socket {
    userId?: string;
    userName?: string;
  }
}

export interface ServerToClientEvents {
  // Game events
  game_state: (gameState: GameState) => void;
  move_made: (data: { move: GameMove; gameState: GameState }) => void;
  game_ended: (data: { result: GameResult; gameState: GameState }) => void;

  // Room events
  player_joined: (data: { userId: string; players: string[]; spectators: string[] }) => void;
  player_left: (data: { userId: string; players: string[]; spectators: string[] }) => void;
  player_disconnected: (data: { userId: string; timestamp: string }) => void;

  // Game actions
  draw_offered: (data: { offeredBy: string }) => void;
  draw_accepted: (data: { acceptedBy: string }) => void;
  draw_declined: (data: { declinedBy: string }) => void;

  // Chat
  message_received: (data: ChatMessage) => void;

  // System
  error: (data: { message: string }) => void;
  pong: (data: { timestamp: string; userId: string }) => void;
}

export interface ClientToServerEvents {
  // Game events
  join_game: (gameId: string) => void;
  leave_game: (gameId: string) => void;
  make_move: (data: { gameId: string; move: GameMove }) => void;
  get_game_state: (gameId: string) => void;

  // Game actions
  offer_draw: (gameId: string) => void;
  accept_draw: (gameId: string) => void;
  decline_draw: (gameId: string) => void;
  resign_game: (gameId: string) => void;

  // Chat
  send_message: (data: { gameId: string; message: string }) => void;

  // System
  ping: () => void;
}
