import { Move, Position } from '../types/shogi';

export class Board {
  private state: string[][];
  private readonly BOARD_SIZE = 9;

  constructor() {
    this.state = this.getInitialState();
  }

  getInitialState(): string[][] {
    // 9x9 の将棋盤初期配置
    // 大文字 = 先手（下側）、小文字 = 後手（上側）
    return [
      ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l'], // 後手の1段目
      ['', 'r', '', '', '', '', '', 'b', ''], // 後手の2段目
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'], // 後手の3段目
      ['', '', '', '', '', '', '', '', ''], // 4段目
      ['', '', '', '', '', '', '', '', ''], // 5段目
      ['', '', '', '', '', '', '', '', ''], // 6段目
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // 先手の7段目
      ['', 'B', '', '', '', '', '', 'R', ''], // 先手の8段目
      ['L', 'N', 'S', 'G', 'K', 'G', 'S', 'N', 'L'], // 先手の9段目
    ];
  }

  setState(newState: string[][]): void {
    if (!this.isValidBoardState(newState)) {
      throw new Error('Invalid board state');
    }
    this.state = newState.map((row) => [...row]);
  }

  getState(): string[][] {
    return this.state.map((row) => [...row]);
  }

  getPieceAt(position: string): string | null {
    const pos = this.parsePosition(position);
    if (!pos) return null;

    return this.state[pos.row][pos.col] || null;
  }

  setPieceAt(position: string, piece: string): void {
    const pos = this.parsePosition(position);
    if (!pos) {
      throw new Error('Invalid position');
    }

    this.state[pos.row][pos.col] = piece;
  }

  movePiece(move: Move): void {
    const fromPos = this.parsePosition(move.from);
    const toPos = this.parsePosition(move.to);

    if (!fromPos || !toPos) {
      throw new Error('Invalid move positions');
    }

    let piece = this.state[fromPos.row][fromPos.col];

    if (!piece) {
      throw new Error('No piece at source position');
    }

    // Handle promotion
    if (move.promoted && this.canPromote(piece, fromPos, toPos)) {
      piece = this.promotePiece(piece);
    }

    // Move the piece
    this.state[toPos.row][toPos.col] = piece;
    this.state[fromPos.row][fromPos.col] = '';
  }

  private parsePosition(position: string): Position | null {
    // Position format: "7f" (column 7, row f)
    // Convert to array indices (0-8)
    if (position.length !== 2) return null;

    const col = parseInt(position[0]) - 1;
    const row = position.charCodeAt(1) - 'a'.charCodeAt(0);

    if (col < 0 || col >= this.BOARD_SIZE || row < 0 || row >= this.BOARD_SIZE) {
      return null;
    }

    return { row, col };
  }

  private isValidBoardState(state: string[][]): boolean {
    if (!state || state.length !== this.BOARD_SIZE) return false;

    for (const row of state) {
      if (!row || row.length !== this.BOARD_SIZE) return false;
    }

    return true;
  }

  private canPromote(piece: string, from: Position, to: Position): boolean {
    // Check if piece can be promoted
    const promotablePieces = ['P', 'L', 'N', 'S', 'B', 'R', 'p', 'l', 'n', 's', 'b', 'r'];

    if (!promotablePieces.includes(piece)) {
      return false;
    }

    // Check promotion zone (last 3 rows for each player)
    const isSente = piece === piece.toUpperCase();

    if (isSente) {
      return from.row <= 2 || to.row <= 2;
    } else {
      return from.row >= 6 || to.row >= 6;
    }
  }

  private promotePiece(piece: string): string {
    const promotionMap: { [key: string]: string } = {
      P: '+P',
      L: '+L',
      N: '+N',
      S: '+S',
      B: '+B',
      R: '+R',
      p: '+p',
      l: '+l',
      n: '+n',
      s: '+s',
      b: '+b',
      r: '+r',
    };

    return promotionMap[piece] || piece;
  }

  isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE;
  }

  isEmpty(row: number, col: number): boolean {
    return this.isInBounds(row, col) && this.state[row][col] === '';
  }

  isEnemyPiece(row: number, col: number, isCurrentPlayerSente: boolean): boolean {
    if (!this.isInBounds(row, col)) return false;

    const piece = this.state[row][col];
    if (!piece) return false;

    const isPieceSente = piece === piece.toUpperCase();
    return isPieceSente !== isCurrentPlayerSente;
  }

  findKing(player: 'sente' | 'gote'): Position | null {
    const kingPiece = player === 'sente' ? 'K' : 'k';

    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (this.state[row][col] === kingPiece) {
          return { row, col };
        }
      }
    }

    return null;
  }
}
