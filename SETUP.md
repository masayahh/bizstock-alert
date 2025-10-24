# BizStock Alert - セットアップガイド

BizStock Alertは、日本株の重要イベントを通知するReact Nativeアプリです。このガイドでは、開発環境のセットアップから実機テストまでを説明します。

## 前提条件

- Node.js 18以上
- npm または yarn
- Expo CLI
- （オプション）OpenAI APIキー（本番データ使用時）

## クイックスタート（モックデータ）

APIキーなしで、すぐにUIを確認できます：

```bash
# 1. 依存関係のインストール
npm ci

# 2. アプリ起動（モックモード）
npm start

# 3. Expo Goで開く
# スマートフォンでQRコードをスキャン
```

モックモードでは、以下の機能が動作します：
- ✅ ウォッチリスト管理
- ✅ ダミーイベント表示（トヨタ、ソニー等）
- ✅ Live Tile表示
- ✅ イベント詳細表示
- ✅ 設定変更

## 本番データパイプライン有効化

実際のEDINET/RSSデータとAI要約を使用するには：

### 1. OpenAI APIキーの取得

1. [OpenAI Platform](https://platform.openai.com/signup)でアカウント作成
2. [API Keys](https://platform.openai.com/api-keys)ページで新しいキーを作成
3. キーをコピー（`sk-...`で始まる文字列）

### 2. 環境変数の設定

```bash
# .envファイルを作成
cp .env.example .env

# .envファイルを編集
# EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-key-here
# EXPO_PUBLIC_MOCK_MODE=false  # 本番モードに切替
```

### 3. アプリ再起動

```bash
# 環境変数を再読み込み
npm start -- --clear
```

## 開発ワークフロー

### コード品質チェック

```bash
# Lint実行
npm run lint

# Lint自動修正
npm run lint:fix

# フォーマット確認
npm run format:check

# フォーマット実行
npm run format

# テスト実行
npm test
```

### 推奨ワークフロー

1. **機能開発**: モックモードで開発
2. **Lint & Test**: `npm run lint && npm test`
3. **本番確認**: `.env`でモックモード解除
4. **コミット**: すべてパスしたらコミット

## ディレクトリ構造

```
bizstock-alert/
├── src/
│   ├── services/          # Phase 1-5のビジネスロジック
│   │   ├── dataIngestionService.ts    # EDINET/RSS取得
│   │   ├── normalizationService.ts    # データ正規化
│   │   ├── clusteringService.ts       # イベントクラスタリング
│   │   ├── aiService.ts               # OpenAI API統合
│   │   ├── summaryService.ts          # AI要約生成
│   │   ├── impactAnalysisService.ts   # 影響度分析
│   │   ├── personalizationService.ts  # パーソナライズ
│   │   └── rankingService.ts          # ランキング
│   ├── store/             # Redux状態管理
│   │   ├── eventsSlice.ts            # イベント状態
│   │   ├── watchlistSlice.ts         # ウォッチリスト
│   │   ├── notificationsSlice.ts     # 通知履歴
│   │   ├── settingsSlice.ts          # 設定
│   │   └── thunks.ts                 # 非同期処理
│   ├── hooks/             # カスタムフック
│   │   └── useAppInit.ts             # アプリ初期化
│   ├── utils/             # ユーティリティ
│   │   └── mockData.ts               # モックデータ生成
│   ├── types/             # TypeScript型定義
│   │   └── events.ts                 # イベント型
│   └── *.tsx              # UIコンポーネント
├── __tests__/             # テストファイル
└── App.tsx                # エントリーポイント
```

## モックモード vs 本番モード

| 項目 | モックモード | 本番モード |
|------|-------------|-----------|
| APIキー | 不要 | OpenAI必須 |
| データソース | ダミー生成 | EDINET/RSS |
| AI要約 | 固定文言 | GPT-3.5生成 |
| コスト | 無料 | OpenAI課金 |
| 用途 | UI開発 | 本番運用 |

## トラブルシューティング

### Q: モックモードなのにデータが表示されない

A: ウォッチリストに銘柄を追加してください（例: 7203, 6758, 9984）

### Q: 本番モードでエラーが出る

A: 以下を確認：
1. `.env`ファイルが存在するか
2. `EXPO_PUBLIC_OPENAI_API_KEY`が正しく設定されているか
3. `EXPO_PUBLIC_MOCK_MODE=false`になっているか
4. アプリを再起動したか（`npm start -- --clear`）

### Q: Push通知が来ない

A: 以下を確認：
1. 実機でテストしているか（シミュレータは通知非対応）
2. 通知権限が許可されているか
3. 設定で「静音モード」がOFFか
4. ウォッチリストに銘柄が登録されているか

## 次のステップ

1. **Phase 7完了**: 環境変数設定 ✅
2. **Phase 8**: 実機テスト・Push通知確認
3. **Phase 9**: エラーハンドリング強化
4. **Phase 10**: ドキュメント整備

## サポート

問題が発生した場合は、以下を確認：
- `npm run lint` でコード品質チェック
- `npm test` でテスト実行
- GitHubのIssueで報告

## ライセンス

MIT License
