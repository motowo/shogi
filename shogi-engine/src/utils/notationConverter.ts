export class NotationConverter {
  convert(move: string, fromFormat: string, toFormat: string): string {
    try {
      switch (fromFormat) {
        case 'standard':
          return this.convertFromStandard(move, toFormat);
        case 'algebraic':
          return this.convertFromAlgebraic(move, toFormat);
        case 'japanese':
          return this.convertFromJapanese(move, toFormat);
        default:
          return move;
      }
    } catch (error) {
      console.error('Error converting notation:', error);
      return move;
    }
  }

  private convertFromStandard(move: string, toFormat: string): string {
    switch (toFormat) {
      case 'algebraic':
        return this.standardToAlgebraic(move);
      case 'japanese':
        return this.standardToJapanese(move);
      default:
        return move;
    }
  }

  private convertFromAlgebraic(move: string, toFormat: string): string {
    switch (toFormat) {
      case 'standard':
        return this.algebraicToStandard(move);
      case 'japanese':
        return this.algebraicToJapanese(move);
      default:
        return move;
    }
  }

  private convertFromJapanese(move: string, toFormat: string): string {
    switch (toFormat) {
      case 'standard':
        return this.japaneseToStandard(move);
      case 'algebraic':
        return this.japaneseToAlgebraic(move);
      default:
        return move;
    }
  }

  private standardToAlgebraic(move: string): string {
    // Convert from format like "7g-7f" to "P-7f"
    const match = move.match(/^([1-9][a-i])-([1-9][a-i])(\+)?$/);
    if (!match) return move;

    const [, from, to, promotion] = match;
    const piece = this.inferPieceFromMove(from, to);

    return `${piece}-${to}${promotion || ''}`;
  }

  private standardToJapanese(move: string): string {
    // Convert from format like "7g-7f" to "▲７六歩"
    const match = move.match(/^([1-9][a-i])-([1-9][a-i])(\+)?$/);
    if (!match) return move;

    const [, from, to, promotion] = match;
    const piece = this.inferPieceFromMove(from, to);
    const japanesePiece = this.pieceToJapanese(piece);
    const japanesePosition = this.positionToJapanese(to);

    return `▲${japanesePosition}${japanesePiece}${promotion ? '成' : ''}`;
  }

  private algebraicToStandard(move: string): string {
    // This would require more context about the board state
    // For now, return as-is
    return move;
  }

  private algebraicToJapanese(move: string): string {
    // This would require more context about the board state
    // For now, return as-is
    return move;
  }

  private japaneseToStandard(move: string): string {
    // Convert from "▲７六歩" to "7g-7f" format
    // This would require reverse lookup and board state
    return move;
  }

  private japaneseToAlgebraic(move: string): string {
    // Convert from "▲７六歩" to "P-7f" format
    // This would require reverse lookup and board state
    return move;
  }

  private inferPieceFromMove(from: string, to: string): string {
    // This is a simplified inference
    // In a real implementation, you would need the board state
    return 'P'; // Default to pawn
  }

  private pieceToJapanese(piece: string): string {
    const pieceMap: { [key: string]: string } = {
      K: '玉',
      R: '飛',
      B: '角',
      G: '金',
      S: '銀',
      N: '桂',
      L: '香',
      P: '歩',
    };

    return pieceMap[piece] || piece;
  }

  private positionToJapanese(position: string): string {
    const col = parseInt(position[0]);
    const row = position.charCodeAt(1) - 'a'.charCodeAt(0) + 1;

    const japaneseNumbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const japaneseColumns = ['', '１', '２', '３', '４', '５', '６', '７', '８', '９'];

    return `${japaneseColumns[col]}${japaneseNumbers[row]}`;
  }
}
