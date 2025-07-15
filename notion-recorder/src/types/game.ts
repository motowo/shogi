export interface GameMove {
  notation: string;
  from?: string;
  to: string;
  piece: string;
  captured?: string;
  promoted?: boolean;
  timestamp: string;
  timeLeft: number;
  player: 'sente' | 'gote';
}

export interface GameResult {
  winner?: string;
  reason: 'checkmate' | 'resignation' | 'draw' | 'timeout' | 'abandonment';
  resignedBy?: string;
  timestamp: string;
}

export interface GameData {
  gameId: string;
  players: {
    sente: string;
    gote: string;
  };
  moves: GameMove[];
  result?: GameResult;
  startTime: string;
  endTime: string;
  duration: number; // seconds
  gameType: 'ai' | 'human' | 'online';
  timeControl: {
    initial: number; // minutes
    increment: number; // seconds
  };
  ratingChange?: number;
  tactics?: string[];
  keyMoments?: string;
  notes?: string;
  tags?: string[];
}

export interface GameAnalysis {
  accuracy: number;
  blunders: string[];
  keyMoments: string;
  openingEvaluation: string;
  middlegameEvaluation: string;
  endgameEvaluation: string;
  suggestions: string[];
}

export interface NotionGamePage {
  id: string;
  gameId: string;
  startTime: string;
  endTime: string;
  sente: string;
  gote: string;
  result: string;
  moves: number;
  tactics: string[];
  duration: number;
  ratingChange: number;
  gameType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QueueJob {
  id: string;
  name: string;
  data: any;
  progress: number;
  state: string;
  result?: any;
  failedReason?: string;
  processedOn?: number;
  finishedOn?: number;
}
