import { NotionService } from '../services/notionService';
import { GameData, GameAnalysis } from '../types/game';

export class GameRecorder {
  private notionService: NotionService;

  constructor(notionService: NotionService) {
    this.notionService = notionService;
  }

  async recordGame(gameData: GameData): Promise<string> {
    try {
      // Enhance game data with analysis
      const enhancedGameData = await this.enhanceGameData(gameData);

      // Create Notion page
      const pageId = await this.notionService.createGamePage(enhancedGameData);

      console.log(`📝 Game recorded: ${gameData.gameId} -> ${pageId}`);

      return pageId;
    } catch (error) {
      console.error('Error recording game:', error);
      throw error;
    }
  }

  async analyzeGame(gameId: string, moves: any[]): Promise<GameAnalysis> {
    try {
      const analysis = await this.performGameAnalysis(moves);

      console.log(`🔍 Game analyzed: ${gameId}`);

      return analysis;
    } catch (error) {
      console.error('Error analyzing game:', error);
      throw error;
    }
  }

  private async enhanceGameData(gameData: GameData): Promise<GameData> {
    // Add tactical analysis
    const tactics = this.analyzeTactics(gameData.moves);

    // Add key moments
    const keyMoments = this.identifyKeyMoments(gameData.moves);

    // Add tags based on game characteristics
    const tags = this.generateGameTags(gameData);

    return {
      ...gameData,
      tactics,
      keyMoments,
      tags: [...(gameData.tags || []), ...tags],
    };
  }

  private analyzeTactics(moves: any[]): string[] {
    const tactics: string[] = [];

    if (moves.length === 0) return tactics;

    // Simple tactical analysis based on move patterns
    const moveNotations = moves.map((move) => move.notation);

    // Check for common openings
    if (moveNotations.includes('7六歩') && moveNotations.includes('4八銀')) {
      tactics.push('居飛車');
    }

    if (moveNotations.includes('7六歩') && moveNotations.includes('6八飛')) {
      tactics.push('四間飛車');
    }

    if (moveNotations.includes('5六歩') && moveNotations.includes('5八飛')) {
      tactics.push('中飛車');
    }

    if (moveNotations.includes('2六歩') && moveNotations.includes('2五歩')) {
      tactics.push('横歩取り');
    }

    if (moveNotations.includes('7七角') && moveNotations.includes('8八角')) {
      tactics.push('角換わり');
    }

    // Check for defensive formations
    if (moveNotations.includes('7九金') && moveNotations.includes('6九金')) {
      tactics.push('矢倉');
    }

    if (moveNotations.includes('5九金') && moveNotations.includes('4九金')) {
      tactics.push('美濃囲い');
    }

    // Default to basic categories if no specific tactics found
    if (tactics.length === 0) {
      tactics.push('その他');
    }

    return tactics;
  }

  private identifyKeyMoments(moves: any[]): string {
    if (moves.length === 0) return '重要局面の分析なし';

    const keyMoments: string[] = [];

    // Look for potential key moments based on move patterns
    moves.forEach((move, index) => {
      // Check for captures
      if (move.captured) {
        keyMoments.push(`${index + 1}手目: ${move.notation} - ${move.captured}を取る`);
      }

      // Check for promotions
      if (move.promoted) {
        keyMoments.push(`${index + 1}手目: ${move.notation} - 駒が成る`);
      }

      // Check for check patterns (simplified)
      if (move.notation.includes('王') || move.notation.includes('玉')) {
        keyMoments.push(`${index + 1}手目: ${move.notation} - 王手関連`);
      }
    });

    if (keyMoments.length === 0) {
      return '平穏な対局でした';
    }

    return keyMoments.slice(0, 5).join('\n'); // Limit to 5 key moments
  }

  private generateGameTags(gameData: GameData): string[] {
    const tags: string[] = [];

    // Duration-based tags
    if (gameData.duration < 300) {
      // Less than 5 minutes
      tags.push('短時間');
    } else if (gameData.duration > 3600) {
      // More than 1 hour
      tags.push('長時間');
    }

    // Move count-based tags
    if (gameData.moves.length < 50) {
      tags.push('短手数');
    } else if (gameData.moves.length > 150) {
      tags.push('長手数');
    }

    // Result-based tags
    if (gameData.result) {
      switch (gameData.result.reason) {
        case 'checkmate':
          tags.push('詰み');
          break;
        case 'resignation':
          tags.push('投了');
          break;
        case 'timeout':
          tags.push('時間切れ');
          break;
        case 'draw':
          tags.push('引き分け');
          break;
      }
    }

    // Game type-based tags
    if (gameData.gameType === 'ai') {
      tags.push('AI対戦');
    } else if (gameData.gameType === 'online') {
      tags.push('オンライン対戦');
    }

    return tags;
  }

  private async performGameAnalysis(moves: any[]): Promise<GameAnalysis> {
    // Simplified game analysis
    const analysis: GameAnalysis = {
      accuracy: this.calculateAccuracy(moves),
      blunders: this.identifyBlunders(moves),
      keyMoments: this.identifyKeyMoments(moves),
      openingEvaluation: this.evaluateOpening(moves),
      middlegameEvaluation: this.evaluateMiddlegame(moves),
      endgameEvaluation: this.evaluateEndgame(moves),
      suggestions: this.generateSuggestions(moves),
    };

    return analysis;
  }

  private calculateAccuracy(moves: any[]): number {
    // Simplified accuracy calculation
    const totalMoves = moves.length;
    const blunderCount = this.identifyBlunders(moves).length;

    return Math.max(0, Math.min(100, 100 - (blunderCount / totalMoves) * 100));
  }

  private identifyBlunders(moves: any[]): string[] {
    const blunders: string[] = [];

    // Simplified blunder detection
    moves.forEach((move, index) => {
      // Check for obvious blunders (losing material without compensation)
      if (move.captured && move.captured.includes('飛') && !move.notation.includes('飛')) {
        blunders.push(`${index + 1}手目: 飛車を取られる`);
      }

      if (move.captured && move.captured.includes('角') && !move.notation.includes('角')) {
        blunders.push(`${index + 1}手目: 角を取られる`);
      }
    });

    return blunders;
  }

  private evaluateOpening(moves: any[]): string {
    const openingMoves = moves.slice(0, 20);

    if (openingMoves.length === 0) {
      return '開局評価なし';
    }

    // Simple opening evaluation
    const hasGoodDevelopment = openingMoves.some(
      (move) =>
        move.notation.includes('銀') || move.notation.includes('金') || move.notation.includes('桂')
    );

    return hasGoodDevelopment ? '良好な開局' : '改善の余地あり';
  }

  private evaluateMiddlegame(moves: any[]): string {
    const middlegameMoves = moves.slice(20, Math.floor(moves.length * 0.8));

    if (middlegameMoves.length === 0) {
      return '中盤評価なし';
    }

    const hasActivePlay = middlegameMoves.some((move) => move.captured);

    return hasActivePlay ? '積極的な中盤' : '慎重な中盤';
  }

  private evaluateEndgame(moves: any[]): string {
    const endgameMoves = moves.slice(Math.floor(moves.length * 0.8));

    if (endgameMoves.length === 0) {
      return '終盤評価なし';
    }

    const hasPrecisePlay = endgameMoves.length > 0;

    return hasPrecisePlay ? '終盤戦あり' : '終盤なし';
  }

  private generateSuggestions(moves: any[]): string[] {
    const suggestions: string[] = [];

    // General suggestions based on move patterns
    if (moves.length < 30) {
      suggestions.push('より長い対局で経験を積みましょう');
    }

    const captureCount = moves.filter((move) => move.captured).length;
    if (captureCount === 0) {
      suggestions.push('積極的な攻めを心がけましょう');
    }

    const promotionCount = moves.filter((move) => move.promoted).length;
    if (promotionCount === 0) {
      suggestions.push('駒の成りを活用しましょう');
    }

    suggestions.push('定跡の勉強をお勧めします');
    suggestions.push('詰将棋で終盤力を鍛えましょう');

    return suggestions;
  }
}
