# 将棋アプリ

ブラウザで将棋を指すことができるWebアプリケーション

## アーキテクチャ

- **フロントエンド**: React + TypeScript
- **API Server**: Node.js + Express
- **WebSocket Server**: Socket.io（リアルタイム対戦）
- **棋譜記録**: Notion API（1ページ1棋譜）
- **認証・DB**: Firebase
- **コンテナ**: Docker + Docker Compose

## 機能

- リアルタイム将棋対戦
- AI対戦
- 棋譜の自動記録（Notion）
- ユーザー認証（Firebase）
- 対局履歴管理

## セットアップ

### 前提条件

- Docker & Docker Compose
- Node.js 18+
- Firebase プロジェクト
- Notion API キー

### 初期設定

1. リポジトリのクローン
2. 環境変数の設定

```bash
cp .env.example .env
# .env ファイルを編集
```

3. 依存関係のインストール

```bash
npm install
```

4. 開発環境の起動

```bash
npm run dev
```

## 開発コマンド

```bash
# 開発環境起動
npm run dev

# テスト実行
npm test

# コード整形
npm run format

# コード品質チェック
npm run lint

# Docker環境停止
npm run down
```

## プロジェクト構造

```
shogi/
├── frontend/          # React アプリケーション
│   ├── src/          # TypeScript ソースコード
│   ├── public/       # 静的ファイル
│   ├── Dockerfile    # Docker 設定
│   └── package.json  # 依存関係
├── api/              # API サーバー
├── websocket/        # WebSocket サーバー
├── notion-recorder/  # Notion 棋譜記録サービス
├── shogi-engine/     # 将棋エンジン
├── docker-compose.yml
└── README.md
```

## 実装状況

### ✅ 完了済み

- プロジェクト構造設定
- Docker Compose設定
- フロントエンド基盤（React + TypeScript）
  - 基本的なReactアプリケーション
  - TypeScript設定
  - Docker対応
  - Nginx設定（プロキシ対応）
- API Server基盤（Node.js + Express）
  - RESTful API設計
  - 認証ミドルウェア
  - ゲーム管理サービス
  - Firebase Admin SDK統合
  - エラーハンドリング
  - TypeScript実装
- WebSocket Server（Socket.io）
  - リアルタイム対戦機能
  - ゲームルーム管理
  - プレイヤー接続管理
  - チャット機能
  - Redis統合
  - 認証ミドルウェア
- Notion Recorder Service（1ページ1棋譜）
  - Notion API統合
  - 棋譜自動記録
  - 戦法分析
  - 重要局面検出
  - Bull Queue による非同期処理
  - Redis キャッシュ
- 将棋エンジン（完全な将棋ロジック）
  - 盤面管理・駒移動処理
  - 指し手検証・合法手生成
  - 王手・詰み判定
  - AI対戦（4段階難易度）
  - 記譜法変換（日本式・代数式）
  - Minimax アルゴリズム
- 統合テスト環境
  - 全サービス統合テスト
  - TDD による品質保証
  - 26項目の包括的テスト

### ✅ 完了済み（追加）

- Firebase統合強化
  - 認証システム完全統合
  - Firestoreによるリアルタイムデータベース
  - ユーザープロフィール管理
  - 対局履歴・統計管理
  - レーティングシステム
- 将棋盤UI実装
  - リアクティブな将棋盤コンポーネント
  - 駒の配置と移動のビジュアル表現
  - 選択可能な駒とハイライト機能
  - レスポンシブデザイン対応
- フロントエンド・バックエンド統合
  - 認証フロー完全統合
  - WebSocket リアルタイム通信
  - APIサービス層実装
  - ゲーム状態管理
  - エラーハンドリング
- ゲームロジック統合
  - 将棋エンジンとAPI統合
  - 指し手検証システム
  - AI対戦機能（4段階難易度）
  - 棋譜記録・変換機能

### 🚧 実装中

- WebSocket通信の最適化
- UI/UXの向上

### 📋 実装予定

- 対局マッチング機能
- チャット機能
- 観戦モード
- 棋譜解析機能

## Notion棋譜記録

対局終了後、以下の形式でNotionページが自動作成されます：

- 1ページ = 1棋譜
- 対局情報（日時、対戦者、結果）
- 完全な棋譜データ
- 分析結果
- 感想・メモ欄

## 開発ルール

詳細な開発ルールは [CLAUDE.md](./CLAUDE.md) を参照してください。
