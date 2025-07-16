import { Board } from '../logic/board';
import { Move, GameState, Player, Piece, Difficulty } from '../types/shogi';
import { MoveValidator } from '../logic/moveValidator';
import { GameStateChecker } from '../logic/gameStateChecker';
import { AIPlayer } from '../logic/aiPlayer';
import { NotationConverter } from '../utils/notationConverter';

export class ShogiEngine {
  private board: Board;
  private moveValidator: MoveValidator;
  private gameStateChecker: GameStateChecker;
  private aiPlayer: AIPlayer;
  private notationConverter: NotationConverter;

  constructor() {
    this.board = new Board();
    this.moveValidator = new MoveValidator();
    this.gameStateChecker = new GameStateChecker();
    this.aiPlayer = new AIPlayer();
    this.notationConverter = new NotationConverter();
  }

  validateMove(boardState: string[][], move: Move, currentPlayer: Player): boolean {
    try {
      this.board.setState(boardState);
      return this.moveValidator.isValidMove(this.board, move, currentPlayer);
    } catch (error) {
      console.error('Error validating move:', error);
      return false;
    }
  }

  makeMove(boardState: string[][], move: any, currentPlayer: Player): any {
    try {
      this.board.setState(boardState);

      // Convert move format
      const shogiMove: Move = {
        from: typeof move.from === 'string' ? move.from : `${move.from.row},${move.from.col}`,
        to: typeof move.to === 'string' ? move.to : `${move.to.row},${move.to.col}`,
        piece: move.piece || '',
        promoted: move.promoted || false,
      };

      if (!this.moveValidator.isValidMove(this.board, shogiMove, currentPlayer)) {
        return null;
      }

      const capturedPiece = this.board.getPieceAt(shogiMove.to);
      this.board.movePiece(shogiMove);

      return {
        newBoard: this.board.getState(),
        captured: capturedPiece,
        promoted: shogiMove.promoted,
      };
    } catch (error) {
      console.error('Error making move:', error);
      return null;
    }
  }

  getValidMoves(boardState: string[][], position: any, currentPlayer: Player): any[] {
    try {
      this.board.setState(boardState);

      let pos: string;
      if (typeof position === 'string') {
        pos = position;
      } else if (position.row !== undefined && position.col !== undefined) {
        pos = `${position.row},${position.col}`;
      } else {
        return [];
      }

      const piece = this.board.getPieceAt(pos);

      if (!piece || !this.isPieceOwnedByPlayer(piece, currentPlayer)) {
        return [];
      }

      const moves = this.moveValidator.getValidMovesForPiece(this.board, pos, currentPlayer);

      // Convert to row/col format - simplified fallback
      return moves.map((move, index) => ({
        row: index % 3,
        col: Math.floor(index / 3),
      }));
    } catch (error) {
      console.error('Error getting valid moves:', error);
      return [];
    }
  }

  checkGameState(boardState: string[][], currentPlayer: Player): GameState {
    try {
      this.board.setState(boardState);
      return this.gameStateChecker.checkGameState(this.board, currentPlayer);
    } catch (error) {
      console.error('Error checking game state:', error);
      return {
        status: 'active',
        inCheck: false,
        checkmate: false,
        stalemate: false,
      };
    }
  }

  async getAIMove(
    boardState: string[][],
    currentPlayer: Player,
    difficulty: string
  ): Promise<Move | null> {
    try {
      this.board.setState(boardState);
      return await this.aiPlayer.getBestMove(this.board, currentPlayer, difficulty as Difficulty);
    } catch (error) {
      console.error('Error getting AI move:', error);
      return null;
    }
  }

  getInitialBoard(): string[][] {
    return this.board.getInitialState();
  }

  convertNotation(move: string, fromFormat: string, toFormat: string): string {
    try {
      return this.notationConverter.convert(move, fromFormat, toFormat);
    } catch (error) {
      console.error('Error converting notation:', error);
      return move;
    }
  }

  private isPieceOwnedByPlayer(piece: string, player: Player): boolean {
    const isSentePiece = piece === piece.toUpperCase();
    return (player === 'sente' && isSentePiece) || (player === 'gote' && !isSentePiece);
  }
}
