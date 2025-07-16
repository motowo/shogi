import { Board } from './board';
import { Move, Player, Position } from '../types/shogi';

export class MoveValidator {
  isValidMove(board: Board, move: Move, player: Player): boolean {
    try {
      // Basic validation
      if (!move.from || !move.to) return false;
      if (move.from === move.to) return false;

      const piece = board.getPieceAt(move.from);
      if (!piece) return false;

      // Check if piece belongs to current player
      const isPieceSente = piece === piece.toUpperCase();
      const isPlayerSente = player === 'sente';
      if (isPieceSente !== isPlayerSente) return false;

      // Check if destination is valid
      const destPiece = board.getPieceAt(move.to);
      if (destPiece && this.isSamePlayer(piece, destPiece)) return false;

      // Check piece-specific movement rules
      if (!this.isValidPieceMove(board, move, piece)) return false;

      return true;
    } catch (error) {
      console.error('Error validating move:', error);
      return false;
    }
  }

  getValidMovesForPiece(board: Board, position: string, player: Player): Move[] {
    const moves: Move[] = [];
    const piece = board.getPieceAt(position);

    if (!piece) return moves;

    // Generate all possible moves for this piece
    const possibleMoves = this.generatePossibleMoves(board, position, piece);

    // Filter valid moves
    for (const move of possibleMoves) {
      if (this.isValidMove(board, move, player)) {
        moves.push(move);
      }
    }

    return moves;
  }

  private isValidPieceMove(board: Board, move: Move, piece: string): boolean {
    const basePiece = piece.replace('+', '').toLowerCase();

    switch (basePiece) {
      case 'k':
        return this.isValidKingMove(board, move);
      case 'r':
        return this.isValidRookMove(board, move);
      case 'b':
        return this.isValidBishopMove(board, move);
      case 'g':
        return this.isValidGoldMove(board, move);
      case 's':
        return this.isValidSilverMove(board, move);
      case 'n':
        return this.isValidKnightMove(board, move);
      case 'l':
        return this.isValidLanceMove(board, move);
      case 'p':
        return this.isValidPawnMove(board, move);
      default:
        return false;
    }
  }

  private isValidKingMove(board: Board, move: Move): boolean {
    const from = this.parsePosition(move.from);
    const to = this.parsePosition(move.to);
    if (!from || !to) return false;

    const dx = Math.abs(to.col - from.col);
    const dy = Math.abs(to.row - from.row);

    return dx <= 1 && dy <= 1;
  }

  private isValidRookMove(board: Board, move: Move): boolean {
    const from = this.parsePosition(move.from);
    const to = this.parsePosition(move.to);
    if (!from || !to) return false;

    // Rook moves horizontally or vertically
    if (from.row !== to.row && from.col !== to.col) return false;

    // Check if path is clear
    return this.isPathClear(board, from, to);
  }

  private isValidBishopMove(board: Board, move: Move): boolean {
    const from = this.parsePosition(move.from);
    const to = this.parsePosition(move.to);
    if (!from || !to) return false;

    // Bishop moves diagonally
    const dx = Math.abs(to.col - from.col);
    const dy = Math.abs(to.row - from.row);

    if (dx !== dy) return false;

    // Check if path is clear
    return this.isPathClear(board, from, to);
  }

  private isValidGoldMove(board: Board, move: Move): boolean {
    const from = this.parsePosition(move.from);
    const to = this.parsePosition(move.to);
    if (!from || !to) return false;

    const dx = to.col - from.col;
    const dy = to.row - from.row;

    // Gold general moves
    const validMoves = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, 0],
    ];

    return validMoves.some(([dy2, dx2]) => dx === dx2 && dy === dy2);
  }

  private isValidSilverMove(board: Board, move: Move): boolean {
    const from = this.parsePosition(move.from);
    const to = this.parsePosition(move.to);
    if (!from || !to) return false;

    const dx = to.col - from.col;
    const dy = to.row - from.row;

    // Silver general moves
    const validMoves = [
      [-1, -1],
      [-1, 0],
      [-1, 1],

      [1, -1],
      [1, 1],
    ];

    return validMoves.some(([dy2, dx2]) => dx === dx2 && dy === dy2);
  }

  private isValidKnightMove(board: Board, move: Move): boolean {
    const from = this.parsePosition(move.from);
    const to = this.parsePosition(move.to);
    if (!from || !to) return false;

    const dx = to.col - from.col;
    const dy = to.row - from.row;

    // Knight moves (2 forward, 1 left/right)
    const piece = board.getPieceAt(move.from);
    const isSente = piece === piece?.toUpperCase();

    if (isSente) {
      return (dx === -1 && dy === -2) || (dx === 1 && dy === -2);
    } else {
      return (dx === -1 && dy === 2) || (dx === 1 && dy === 2);
    }
  }

  private isValidLanceMove(board: Board, move: Move): boolean {
    const from = this.parsePosition(move.from);
    const to = this.parsePosition(move.to);
    if (!from || !to) return false;

    // Lance moves straight forward
    if (from.col !== to.col) return false;

    const piece = board.getPieceAt(move.from);
    const isSente = piece === piece?.toUpperCase();

    if (isSente) {
      if (to.row >= from.row) return false;
    } else {
      if (to.row <= from.row) return false;
    }

    return this.isPathClear(board, from, to);
  }

  private isValidPawnMove(board: Board, move: Move): boolean {
    const from = this.parsePosition(move.from);
    const to = this.parsePosition(move.to);
    if (!from || !to) return false;

    // Pawn moves one square forward
    if (from.col !== to.col) return false;

    const piece = board.getPieceAt(move.from);
    const isSente = piece === piece?.toUpperCase();

    if (isSente) {
      return to.row === from.row - 1;
    } else {
      return to.row === from.row + 1;
    }
  }

  private isPathClear(board: Board, from: Position, to: Position): boolean {
    const dx = to.col - from.col;
    const dy = to.row - from.row;

    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
    const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

    for (let i = 1; i < steps; i++) {
      const checkRow = from.row + i * stepY;
      const checkCol = from.col + i * stepX;

      if (board.getPieceAt(this.formatPosition(checkRow, checkCol))) {
        return false;
      }
    }

    return true;
  }

  private generatePossibleMoves(board: Board, position: string, piece: string): Move[] {
    const moves: Move[] = [];

    // Generate all possible destinations for the piece
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const to = this.formatPosition(row, col);
        if (to !== position) {
          moves.push({ from: position, to });
        }
      }
    }

    return moves;
  }

  private parsePosition(position: string): Position | null {
    if (position.length !== 2) return null;

    const col = parseInt(position[0]) - 1;
    const row = position.charCodeAt(1) - 'a'.charCodeAt(0);

    if (col < 0 || col >= 9 || row < 0 || row >= 9) return null;

    return { row, col };
  }

  private formatPosition(row: number, col: number): string {
    return `${col + 1}${String.fromCharCode('a'.charCodeAt(0) + row)}`;
  }

  private isSamePlayer(piece1: string, piece2: string): boolean {
    const isPiece1Sente = piece1 === piece1.toUpperCase();
    const isPiece2Sente = piece2 === piece2.toUpperCase();
    return isPiece1Sente === isPiece2Sente;
  }
}
