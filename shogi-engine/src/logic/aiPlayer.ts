import { Board } from './board';
import { MoveValidator } from './moveValidator';
import { GameStateChecker } from './gameStateChecker';
import { Player, Move, Difficulty } from '../types/shogi';

export class AIPlayer {
  private moveValidator: MoveValidator;
  private gameStateChecker: GameStateChecker;

  constructor() {
    this.moveValidator = new MoveValidator();
    this.gameStateChecker = new GameStateChecker();
  }

  async getBestMove(board: Board, player: Player, difficulty: Difficulty): Promise<Move | null> {
    const allMoves = this.getAllValidMoves(board, player);
    if (allMoves.length === 0) return null;

    switch (difficulty) {
      case 'easy':
        return this.getRandomMove(allMoves);
      case 'medium':
        return this.getMediumMove(board, allMoves, player);
      case 'hard':
        return this.getHardMove(board, allMoves, player);
      case 'expert':
        return this.getExpertMove(board, allMoves, player);
      default:
        return this.getMediumMove(board, allMoves, player);
    }
  }

  private getAllValidMoves(board: Board, player: Player): Move[] {
    const moves: Move[] = [];

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
          moves.push(...validMoves);
        }
      }
    }

    return moves;
  }

  private getRandomMove(moves: Move[]): Move {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  private getMediumMove(board: Board, moves: Move[], player: Player): Move {
    // Simple evaluation: prefer captures and center control
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      let score = 0;

      // Prefer captures
      const capturedPiece = board.getPieceAt(move.to);
      if (capturedPiece) {
        score += this.getPieceValue(capturedPiece) * 10;
      }

      // Prefer center control
      const toPos = this.parsePosition(move.to);
      if (toPos) {
        const centerDistance = Math.abs(toPos.row - 4) + Math.abs(toPos.col - 4);
        score += (8 - centerDistance) * 2;
      }

      // Add some randomness
      score += Math.random() * 5;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private getHardMove(board: Board, moves: Move[], player: Player): Move {
    // Minimax with limited depth
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const score = this.minimax(board, move, player, 2, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private getExpertMove(board: Board, moves: Move[], player: Player): Move {
    // Minimax with deeper search
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const score = this.minimax(board, move, player, 3, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(
    board: Board,
    move: Move,
    player: Player,
    depth: number,
    isMaximizing: boolean
  ): number {
    // Simple minimax implementation
    const originalState = board.getState();

    try {
      // Make the move
      board.movePiece(move);

      // Check game state
      const gameState = this.gameStateChecker.checkGameState(board, player);

      if (gameState.status === 'checkmate') {
        board.setState(originalState);
        return isMaximizing ? -1000 : 1000;
      }

      if (depth === 0) {
        const score = this.evaluatePosition(board, player);
        board.setState(originalState);
        return score;
      }

      const nextPlayer = player === 'sente' ? 'gote' : 'sente';
      const nextMoves = this.getAllValidMoves(board, nextPlayer);

      if (isMaximizing) {
        let maxScore = -Infinity;
        for (const nextMove of nextMoves.slice(0, 10)) {
          // Limit branching
          const score = this.minimax(board, nextMove, nextPlayer, depth - 1, false);
          maxScore = Math.max(maxScore, score);
        }
        board.setState(originalState);
        return maxScore;
      } else {
        let minScore = Infinity;
        for (const nextMove of nextMoves.slice(0, 10)) {
          // Limit branching
          const score = this.minimax(board, nextMove, nextPlayer, depth - 1, true);
          minScore = Math.min(minScore, score);
        }
        board.setState(originalState);
        return minScore;
      }
    } catch (error) {
      board.setState(originalState);
      return 0;
    }
  }

  private evaluatePosition(board: Board, player: Player): number {
    let score = 0;

    // Material count
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board.getPieceAt(this.formatPosition(row, col));
        if (piece) {
          const pieceValue = this.getPieceValue(piece);
          const isPieceSente = piece === piece.toUpperCase();

          if ((player === 'sente' && isPieceSente) || (player === 'gote' && !isPieceSente)) {
            score += pieceValue;
          } else {
            score -= pieceValue;
          }
        }
      }
    }

    return score;
  }

  private getPieceValue(piece: string): number {
    const basePiece = piece.replace('+', '').toLowerCase();

    const values: { [key: string]: number } = {
      k: 10000,
      r: 500,
      b: 300,
      g: 200,
      s: 200,
      n: 100,
      l: 100,
      p: 10,
    };

    return values[basePiece] || 0;
  }

  private parsePosition(position: string): { row: number; col: number } | null {
    if (position.length !== 2) return null;

    const col = parseInt(position[0]) - 1;
    const row = position.charCodeAt(1) - 'a'.charCodeAt(0);

    if (col < 0 || col >= 9 || row < 0 || row >= 9) return null;

    return { row, col };
  }

  private formatPosition(row: number, col: number): string {
    return `${col + 1}${String.fromCharCode('a'.charCodeAt(0) + row)}`;
  }
}
