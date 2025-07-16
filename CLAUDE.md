# 将棋アプリ開発ルール

## 開発フロー

### 基本ルール

- git ブランチを作成し開発をスタートします
- 1タスクごとに実施してください

### 新しい開発開始時の手順

1. mainブランチに切り替える (`git checkout main`)
2. 最新のmainブランチを取得 (`git pull origin main`)
3. mainブランチから新しいブランチを作成 (`git checkout -b feature/xxx`)
4. 開発を開始する

### タスク開始時の手順

1. 仕様を満たすテストを作成する
2. テストが失敗することを確認する(TDD)

### タスク完了時の手順

1. コードをフォーマッターにかけ、コードの体裁を整える
2. テストを実行してください。エラーなくテストが実行できることを確認する
3. README.mdに仕様を記載する(更新する)
4. Git に commit する。タスクの内容をコメントに記載する

### 開発完了時の手順

1. Linter を実行してコード品質をチェック (`npm run lint`)
2. Formatter を実行してコード整形 (`npm run format`)
3. テストを実行してエラーがないことを確認 (`npm run test`)
4. 全チェックが通ったら、Git に pushする (`git push -u origin feature/xxx`)
5. プルリクエストに記載する内容の提案をだしてください

## プロジェクト構成

### アーキテクチャ

- **フロントエンド**: React + TypeScript
- **API Server**: Node.js + Express
- **WebSocket Server**: Socket.io
- **棋譜記録**: Notion API (1ページ1棋譜)
- **認証・DB**: Firebase
- **コンテナ**: Docker + Docker Compose

### サービス構成

```
frontend (React)
├── api (Node.js/Express)
├── websocket (Socket.io)
├── notion-recorder (Notion API)
├── shogi-engine (将棋AI)
└── redis (セッション管理)
```

## テスト戦略

- 各サービスは独立してテスト可能
- TDD（テスト駆動開発）を採用
- Jest を使用したユニットテスト
- 統合テストはDocker Compose環境で実行

## コード品質

- TypeScript を使用（フロントエンド・バックエンド共通）
- ESLint + Prettier でコード品質管理
- Git commit 前に自動フォーマット実行

## Notion棋譜記録仕様

- 1ページ = 1棋譜として記録
- 対局終了後に自動でNotionページ作成
- 棋譜データ、分析結果、感想を含む完全な記録

## Firebase統合

- Authentication: ユーザー認証
- Firestore: リアルタイム対局データ
- Hosting: フロントエンドデプロイ
- Cloud Storage: 画像・ファイル保存

## フォーマッター・リンター

- npm run format: Prettier でコード整形
- npm run lint: ESLint でコード品質チェック
- npm run test: Jest でテスト実行
