export type Player = 'sente' | 'gote';

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: string;
  to: string;
  piece?: string;
  captured?: string;
  promoted?: boolean;
}

export interface GameState {
  status: 'active' | 'checkmate' | 'stalemate' | 'draw';
  inCheck: boolean;
  checkmate: boolean;
  stalemate: boolean;
  winner?: Player;
}

export type Piece = string;

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface MoveResult {
  board: string[][];
  captured?: string;
  promoted?: boolean;
}

// Piece notation
export const PIECES = {
  // Sente (uppercase)
  KING: 'K',
  ROOK: 'R',
  BISHOP: 'B',
  GOLD: 'G',
  SILVER: 'S',
  KNIGHT: 'N',
  LANCE: 'L',
  PAWN: 'P',
  // Gote (lowercase)
  king: 'k',
  rook: 'r',
  bishop: 'b',
  gold: 'g',
  silver: 's',
  knight: 'n',
  lance: 'l',
  pawn: 'p',
  // Promoted pieces
  PROMOTED_ROOK: '+R',
  PROMOTED_BISHOP: '+B',
  PROMOTED_SILVER: '+S',
  PROMOTED_KNIGHT: '+N',
  PROMOTED_LANCE: '+L',
  PROMOTED_PAWN: '+P',
  promoted_rook: '+r',
  promoted_bishop: '+b',
  promoted_silver: '+s',
  promoted_knight: '+n',
  promoted_lance: '+l',
  promoted_pawn: '+p',
};
