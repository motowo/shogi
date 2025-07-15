import { Client } from '@notionhq/client';
import { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints';
import { GameData, NotionGamePage } from '../types/game';

export class NotionService {
  private notion: Client;
  private databaseId: string;

  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    this.databaseId = process.env.NOTION_GAMES_DATABASE_ID || '';

    if (!this.databaseId) {
      throw new Error('NOTION_GAMES_DATABASE_ID is required');
    }
  }

  async createGamePage(gameData: GameData): Promise<string> {
    try {
      const pageProperties = this.buildPageProperties(gameData);
      const pageContent = this.buildPageContent(gameData);

      const response = await this.notion.pages.create({
        parent: { database_id: this.databaseId },
        properties: pageProperties,
        children: pageContent,
      } as CreatePageParameters);

      console.log(`✅ Notion page created: ${response.id}`);
      return response.id;
    } catch (error) {
      console.error('Error creating Notion page:', error);
      throw error;
    }
  }

  async updateGamePage(pageId: string, gameData: GameData): Promise<void> {
    try {
      const pageProperties = this.buildPageProperties(gameData);

      await this.notion.pages.update({
        page_id: pageId,
        properties: pageProperties,
      });

      console.log(`✅ Notion page updated: ${pageId}`);
    } catch (error) {
      console.error('Error updating Notion page:', error);
      throw error;
    }
  }

  async appendGameAnalysis(pageId: string, analysis: string): Promise<void> {
    try {
      await this.notion.blocks.children.append({
        block_id: pageId,
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ text: { content: '📊 棋譜分析' } }],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: analysis } }],
            },
          },
        ],
      });

      console.log(`✅ Analysis appended to page: ${pageId}`);
    } catch (error) {
      console.error('Error appending analysis:', error);
      throw error;
    }
  }

  private buildPageProperties(gameData: GameData): any {
    return {
      対局ID: {
        title: [{ text: { content: gameData.gameId } }],
      },
      開始時刻: {
        date: { start: gameData.startTime },
      },
      終了時刻: {
        date: { start: gameData.endTime },
      },
      先手: {
        rich_text: [{ text: { content: gameData.players.sente } }],
      },
      後手: {
        rich_text: [{ text: { content: gameData.players.gote } }],
      },
      結果: {
        select: { name: this.getResultText(gameData.result) },
      },
      手数: {
        number: gameData.moves.length,
      },
      戦法: {
        multi_select: gameData.tactics.map((tactic) => ({ name: tactic })),
      },
      対局時間: {
        number: gameData.duration,
      },
      レーティング変動: {
        number: gameData.ratingChange || 0,
      },
      対局形式: {
        select: { name: gameData.gameType },
      },
      タグ: {
        multi_select: gameData.tags.map((tag) => ({ name: tag })),
      },
    };
  }

  private buildPageContent(gameData: GameData): any[] {
    return [
      // 対局情報セクション
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '📋 対局情報' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { text: { content: `対局形式: ${gameData.gameType}` } },
            { text: { content: '\n' } },
            {
              text: {
                content: `持ち時間: ${gameData.timeControl.initial}分 + ${gameData.timeControl.increment}秒`,
              },
            },
            { text: { content: '\n' } },
            {
              text: {
                content: `対局時間: ${Math.floor(gameData.duration / 60)}分${gameData.duration % 60}秒`,
              },
            },
          ],
        },
      },

      // 棋譜セクション
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🎯 棋譜' } }],
        },
      },
      {
        object: 'block',
        type: 'code',
        code: {
          language: 'plain text',
          rich_text: [{ text: { content: this.formatMoves(gameData.moves) } }],
        },
      },

      // 重要局面セクション
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '🔍 重要局面' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: gameData.keyMoments || '分析中...' } }],
        },
      },

      // 感想・メモセクション
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '📝 感想・メモ' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: gameData.notes || '感想をここに記録...' } }],
        },
      },
    ];
  }

  private formatMoves(moves: any[]): string {
    return moves
      .map((move, index) => {
        const moveNumber = Math.floor(index / 2) + 1;
        const player = index % 2 === 0 ? '▲' : '△';
        return `${moveNumber}${player}${move.notation}`;
      })
      .join(' ');
  }

  private getResultText(result: any): string {
    if (!result) return '対局中';

    switch (result.reason) {
      case 'checkmate':
        return result.winner ? '勝ち（詰み）' : '負け（詰み）';
      case 'resignation':
        return result.winner ? '勝ち（投了）' : '負け（投了）';
      case 'timeout':
        return result.winner ? '勝ち（時間切れ）' : '負け（時間切れ）';
      case 'draw':
        return '引き分け';
      default:
        return '不明';
    }
  }

  async searchGamePages(query: string): Promise<NotionGamePage[]> {
    try {
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
        filter: {
          or: [
            {
              property: '対局ID',
              title: { contains: query },
            },
            {
              property: '先手',
              rich_text: { contains: query },
            },
            {
              property: '後手',
              rich_text: { contains: query },
            },
          ],
        },
        sorts: [
          {
            property: '開始時刻',
            direction: 'descending',
          },
        ],
      });

      return response.results.map((page) => this.parseNotionPage(page));
    } catch (error) {
      console.error('Error searching game pages:', error);
      throw error;
    }
  }

  private parseNotionPage(page: any): NotionGamePage {
    const properties = page.properties;

    return {
      id: page.id,
      gameId: properties['対局ID']?.title?.[0]?.text?.content || '',
      startTime: properties['開始時刻']?.date?.start || '',
      endTime: properties['終了時刻']?.date?.start || '',
      sente: properties['先手']?.rich_text?.[0]?.text?.content || '',
      gote: properties['後手']?.rich_text?.[0]?.text?.content || '',
      result: properties['結果']?.select?.name || '',
      moves: properties['手数']?.number || 0,
      tactics: properties['戦法']?.multi_select?.map((t: any) => t.name) || [],
      duration: properties['対局時間']?.number || 0,
      ratingChange: properties['レーティング変動']?.number || 0,
      gameType: properties['対局形式']?.select?.name || '',
      tags: properties['タグ']?.multi_select?.map((t: any) => t.name) || [],
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
    };
  }
}
