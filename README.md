# BizStock Alert

**通知ファーストの日本株IRイベントアプリ**

EDINETやIR/PR配信から重要イベントを自動検出し、AIで要約・影響度判定してプッシュ通知。価格表示なし、一次情報への導線を重視した設計。

[![Tests](https://img.shields.io/badge/tests-41%20passed-success)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49-blue)](https://expo.dev/)

## ✨ 特徴

- 📰 **通知ファースト**: 90文字以内の簡潔な通知で即座に把握
- 🎯 **パーソナライズ**: ウォッチリスト銘柄の影響度別ランキング
- 🤖 **AI要約**: OpenAI GPT-3.5による150-250文字の要約（禁止ワード検証付き）
- 🔗 **出典リンク**: 一次情報への直接アクセス（価格表示なし）
- 🌅 **定時Digest**: 朝08:30、昼12:15、引け後15:45の3回配信
- 🔕 **静寂モード**: 通知制御（即時/Digest/静音/続報のみ）

## 🚀 クイックスタート

```bash
# インストール
npm ci

# モックモードで起動（APIキー不要）
npm start
```

詳細は [SETUP.md](./SETUP.md) を参照してください。

## 📁 プロジェクト構成

```
src/
├── services/          # ビジネスロジック（Phase 1-5）
│   ├── dataIngestionService.ts    # EDINET/RSS取得
│   ├── clusteringService.ts       # イベントクラスタリング
│   ├── aiService.ts               # OpenAI統合
│   ├── personalizationService.ts  # パーソナライズ
│   └── rankingService.ts          # ランキング
├── store/             # Redux状態管理
├── hooks/             # カスタムフック
├── utils/             # ユーティリティ（モックデータ等）
└── types/             # TypeScript型定義
```

## 🔧 開発フロー

```bash
# コード品質チェック
npm run lint
npm test

# フォーマット
npm run format

# モックモード（開発用）
EXPO_PUBLIC_MOCK_MODE=true npm start

# 本番モード（要OpenAI APIキー）
EXPO_PUBLIC_MOCK_MODE=false npm start
```

## 📊 実装進捗

- ✅ **Phase 0**: 開発環境整備・仕様整合性
- ✅ **Phase 1**: データ取得サービス層（EDINET/RSS）
- ✅ **Phase 2**: 通知スケジューラ（08:30/12:15/15:45）
- ✅ **Phase 3**: AI要約パイプライン（OpenAI統合）
- ✅ **Phase 4**: イベントクラスタリング・重複排除
- ✅ **Phase 5**: パーソナライズエンジン（影響推定・ランキング）
- ✅ **Phase 6**: UI統合・モックデータ実装
- ✅ **Phase 7**: 環境変数設定・本番パイプライン有効化
- ✅ **Phase 8**: デバッグ画面・エラーハンドリング・実機テスト準備
- ⬜ **Phase 9**: パフォーマンス最適化・本番データパイプライン統合
- ⬜ **Phase 10**: ドキュメント整備・リリース準備

**進捗率: 約85%** 🎉

## 🧪 テスト

```bash
npm test
```

- 41テスト全てパス
- カバレッジ: normalization, clustering, personalization, ranking

## 🎨 デザイン仕様

- **Calm Black**: 黒基調の静かなUI
- **影響度表記**: 強（🚨）/ 中（⚠️）/ 弱（ℹ️）
- **90文字通知**: grapheme-safe切り詰め
- **出典明示**: 「会社IR」「EDINET」「PR配信」等

## 🔐 環境変数

`.env.example`をコピーして`.env`を作成：

```bash
cp .env.example .env
```

必須変数:
- `EXPO_PUBLIC_OPENAI_API_KEY`: OpenAI APIキー（本番モード時）
- `EXPO_PUBLIC_MOCK_MODE`: `true`でモック、`false`で本番

詳細は [.env.example](./.env.example) を参照。

## 📖 ドキュメント

- [SETUP.md](./SETUP.md) - セットアップガイド
- [TESTING.md](./TESTING.md) - 実機テストガイド
- [MANUAL_TASKS.md](./MANUAL_TASKS.md) - 手動作業タスク一覧 ⭐
- [TASKS.md](./TASKS.md) - 実装タスク一覧
- [CLAUDE.md](./CLAUDE.md) - 開発ガイドライン

## 🛠️ 技術スタック

- **Frontend**: React Native 0.72, Expo 49, TypeScript 5.1
- **State**: Redux Toolkit 1.9
- **Data**: EDINET API, RSS/Atom Parser
- **AI**: OpenAI GPT-3.5-turbo
- **Notification**: expo-notifications
- **Test**: Jest 29

## 🤝 コントリビューション

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 ライセンス

MIT License

## 🙏 謝辞

- EDINET（金融庁）: 有価証券報告書等のデータ提供
- OpenAI: AI要約・影響度分析
- Expo: クロスプラットフォーム開発基盤

---

**Built with ❤️ using Claude Code**
