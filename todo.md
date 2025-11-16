# SatireScope - Project TODO

## Phase 1: Project Setup and Backend Core Logic

### Technology Stack & Environment Setup
- [x] Next.js + TypeScript フロントエンド初期化
- [x] Express + TypeScript バックエンド初期化
- [x] PostgreSQL データベース接続設定
- [x] Tailwind CSS セットアップ
- [x] twitter-api-v2 ライブラリのインストール
- [x] node-cron ライブラリのインストール
- [x] 暗号化ライブラリ (bcrypt) のインストール

### Database Design
- [x] twitter_configs テーブル設計・実装
- [x] posted_tweets テーブル設計・実装
- [x] ER図作成
- [x] データベーススキーマのマイグレーション実行

### Backend API Design & Implementation
- [x] X APIキー登録エンドポイント実装 (createConfig)
- [x] X APIキー更新エンドポイント実装 (updateConfig)
- [x] X APIキー削除エンドポイント実装 (deleteConfig)
- [x] X APIキー取得エンドポイント実装 (getConfigs)
- [x] 自動投稿ON/OFF切り替えエンドポイント実装 (toggleActive)
- [x] APIキー暗号化ロジック実装
- [x] APIキー復号ロジック実装

## Phase 2: Automated Posting Engine

### News Retrieval Module
- [x] ニュース取得関数実装 (fetchNewsArticles)
- [x] 複数ニュースソース対応 (BBC, CNN など)
- [x] ニュースキャッシング機構実装

### AI Content Generation Module
- [x] ニュース記事抽出・要約関数実装
- [x] LLM API統合 (ツイート文生成)
- [x] LLM API統合 (コメント生成)
- [x] 画像生成プロンプト生成関数実装

### AI Image Generation Module
- [x] 画像生成API統合
- [x] 生成画像の一時保存・URL取得

### Twitter Posting Module
- [x] twitter-api-v2 統合
- [x] 画像付きツイート投稿関数実装
- [x] 投稿ログ記録関数実装

### Scheduler Implementation
- [x] node-cron スケジューラー設定 (1時間ごと)
- [x] アクティブ設定の自動投稿実行ロジック

## Phase 3: Frontend (Settings Page)

### API Key Registration Form
- [x] X API Key入力フォーム作成
- [x] API Key Secret入力フォーム作成
- [x] Access Token入力フォーム作成
- [x] Access Token Secret入力フォーム作成
- [x] パスワード形式での入力隠蔽実装
- [x] 登録成功後のUI切り替え実装
- [x] 「設定済み」ステータス表示
- [x] 「設定解除」ボタン実装

### Automated Posting Control Panel
- [x] ON/OFFトグルスイッチ実装
- [x] バックエンド連携実装

### Posted Tweets Log Display
- [x] 投稿履歴一覧表示
- [x] ツイート内容表示
- [x] 画像表示
- [x] 元ニュースへのリンク表示

## Phase 4: Testing and Deployment

### Testing
- [x] APIキー暗号化・復号テスト
- [x] エンドツーエンドテスト
- [x] 実際のX投稿確認
- [x] フロントエンドUI動作確認

### Deployment
- [x] 環境変数の安全な管理方法確立
- [x] デプロイメント手順ドキュメント作成
- [x] 本番環境設定
- [x] チェックポイント作成

## Phase 5: Final Delivery
- [x] ユーザーガイド作成 (userGuide.md)
- [x] 最終チェックポイント作成


## Bug Fixes & Enhancements

### Navigation Issues
- [x] Settings ページのナビゲーション問題を修正
- [x] Settings ページにホームへ戻るボタンを追加
- [x] Posted Tweets ページにホームへ戻るボタンを追加

### Manual Posting Feature
- [x] 手動投稿トリガーAPI実装
- [x] ホームページに手動投稿ボタンを追加
- [x] 手動投稿の進捗表示実装

### News Retrieval Enhancement
- [x] ニュース取得ロジックを改良（複数ニュースソース対応）
- [x] 27個の異なるニュース記事を実装
- [x] 実際のニュースメディア URL を使用

## Current Issues & Fixes (v2)
- [x] X投稿エラー修正 - twitter-api-v2 API 使用方法を改善
- [x] 実際の最新ニュースを取得してツイートを生成
- [ ] 手動投稿機能のテスト
