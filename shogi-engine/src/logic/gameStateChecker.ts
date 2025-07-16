import { Board } from './board';
import { MoveValidator } from './moveValidator';
import { Player, GameState } from '../types/shogi';

export class GameStateChecker {
  private moveValidator: MoveValidator;

  constructor() {
    this.moveValidator = new MoveValidator();
  }

  checkGameState(board: Board, currentPlayer: Player): GameState {
    const inCheck = this.isInCheck(board, currentPlayer);
    const hasValidMoves = this.hasValidMoves(board, currentPlayer);

    if (inCheck && !hasValidMoves) {
      return {
        status: 'checkmate',
        inCheck: true,
        checkmate: true,
        stalemate: false,
        winner: currentPlayer === 'sente' ? 'gote' : 'sente',
      };
    }

    if (!inCheck && !hasValidMoves) {
      return {
        status: 'stalemate',
        inCheck: false,
        checkmate: false,
        stalemate: true,
      };
    }

    return {
      status: 'active',
      inCheck,
      checkmate: false,
      stalemate: false,
    };
  }

  private isInCheck(board: Board, player: Player): boolean {
    const kingPosition = board.findKing(player);
    if (!kingPosition) return false;

    const opponent = player === 'sente' ? 'gote' : 'sente';

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board.getPieceAt(this.formatPosition(row, col));
        if (!piece) continue;

        const isPieceSente = piece === piece.toUpperCase();
        const isOpponentPiece =
          (opponent === 'sente' && isPieceSente) || (opponent === 'gote' && !isPieceSente);

        if (isOpponentPiece) {
          const move = {
            from: this.formatPosition(row, col),
            to: this.formatPosition(kingPosition.row, kingPosition.col),
          };

          if (this.moveValidator.isValidMove(board, move, opponent)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private hasValidMoves(board: Board, player: Player): boolean {
    // Check all pieces of the current player
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board.getPieceAt(this.formatPosition(row, col));
        if (!piece) continue;

        const isPieceSente = piece === piece.toUpperCase();
        const isCurrentPlayerPiece =
          (player === 'sente' && isPieceSente) || (player === 'gote' && !isPieceSente);

        if (isCurrentPlayerPiece) {
          const position = this.formatPosition(row, col);
          const validMoves = this.moveValidator.getValidMovesForPiece(board, position, player);

          // Check if any move doesn't leave the king in check
          for (const move of validMoves) {
            if (this.isMoveSafe(board, move, player)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  private isMoveSafe(board: Board, move: any, player: Player): boolean {
    // Make a copy of the board
    const originalState = board.getState();

    try {
      // Make the move
      board.movePiece(move);

      // Check if king is still in check after this move
      const inCheck = this.isInCheck(board, player);

      // Restore the board
      board.setState(originalState);

      return !inCheck;
    } catch (error) {
      // Restore the board in case of error
      board.setState(originalState);
      return false;
    }
  }

  private formatPosition(row: number, col: number): string {
    return `${col + 1}${String.fromCharCode('a'.charCodeAt(0) + row)}`;
  }
}
