# BizStock Alert - 手動作業タスク一覧

このドキュメントでは、開発者が**手動で行う必要があるタスク**をまとめています。

## 📋 必須タスク

### 1. OpenAI APIキーの取得と設定

**いつ**: 本番データパイプラインを使用する場合（モックモード卒業時）

**手順**:

```bash
# 1. OpenAI Platform でアカウント作成
# https://platform.openai.com/signup

# 2. APIキーを作成
# https://platform.openai.com/api-keys
# 「Create new secret key」をクリック
# キーをコピー（sk-...で始まる文字列）

# 3. .envファイルを作成
cp .env.example .env

# 4. .envファイルを編集
# EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-key-here
# EXPO_PUBLIC_MOCK_MODE=false

# 5. アプリを再起動
npm start -- --clear
```

**コスト**:
- gpt-3.5-turbo: $0.0015/1K tokens（入力）、$0.002/1K tokens（出力）
- 1イベント要約: 約500 tokens → $0.001程度
- 想定: 100イベント/日 → $0.10/日 → $3/月

---

### 2. Expo Goアプリのインストール

**いつ**: 実機テストを行う場合

**手順**:

**iOS**:
```bash
# App Storeで「Expo Go」を検索してインストール
# https://apps.apple.com/app/expo-go/id982107779
```

**Android**:
```bash
# Google Playで「Expo Go」を検索してインストール
# https://play.google.com/store/apps/details?id=host.exp.exponent
```

---

### 3. 実機での動作確認

**いつ**: Phase 8完了後、実機テスト時

**手順**:

```bash
# 1. アプリ起動
npm start

# 2. QRコードが表示される

# 3. 実機でスキャン
# iOS: カメラアプリでスキャン
# Android: Expo GoアプリでスキャンExpo Goアプリでスキャン

# 4. アプリが起動することを確認

# 5. TESTING.mdのテストシナリオを実行
```

**確認項目**:
- [ ] アプリが起動するか
- [ ] ウォッチリスト追加/削除が動作するか
- [ ] デバッグ画面が開くか（タイトル長押し）
- [ ] モックデータ生成が動作するか
- [ ] イベント詳細が表示されるか
- [ ] 設定変更が動作するか

---

### 4. Push通知の動作確認（実機のみ）

**いつ**: 実機テスト時（シミュレータでは通知非対応）

**手順**:

```bash
# 1. 実機でアプリを起動

# 2. 通知権限を許可

# 3. デバッグ画面を開く（タイトル長押し）

# 4. 「テスト通知送信」をタップ

# 5. アプリをバックグラウンドに移動
# （ホーム画面に戻る）

# 6. 通知が表示されることを確認
```

**確認項目**:
- [ ] 通知が表示されるか
- [ ] タイトルと本文が正しいか
- [ ] 通知をタップしてアプリが開くか
- [ ] 通知履歴に記録されるか

---

## 🔧 オプションタスク

### 5. 本番データパイプラインの有効化

**いつ**: OpenAI APIキーを取得した後、実データを使用する場合

**手順**:

```bash
# 1. .envファイルを編集
# EXPO_PUBLIC_MOCK_MODE=false

# 2. src/store/thunks.ts の以下のコメントを解除
# (TODO: Phase 9以降で実装予定)

# 3. データ取得サービスをテスト
# - EDINETからのデータ取得
# - RSSフィードの解析
# - AI要約の生成
```

**注意**:
- 本番モードでは**APIコストが発生**します
- エラーハンドリングを確認してください
- Rate Limitエラーに注意してください

---

### 6. カスタムRSSフィードの追加

**いつ**: デフォルト以外のRSSフィードを監視したい場合

**手順**:

```bash
# 1. .envファイルに追加
# EXPO_PUBLIC_RSS_FEEDS=https://example.com/ir/rss,https://example2.com/pr/feed

# 2. または、src/services/rssService.ts を直接編集
```

---

### 7. ローカル環境でのビルド（オプション）

**いつ**: Expo Goを使わず、スタンドアロンアプリとして配布する場合

**手順**:

```bash
# iOS (Macのみ)
eas build --platform ios

# Android
eas build --platform android

# または
expo build:ios
expo build:android
```

**注意**:
- Expo Application Services (EAS) のアカウントが必要
- ビルドには時間がかかります（15-30分）
- Apple Developer Account ($99/年) が必要（iOS）

---

### 8. App Store / Google Play への提出

**いつ**: 一般ユーザーに配布する場合

**手順**: 別途、App Store Connect / Google Play Console のガイドを参照

**必要なもの**:
- Apple Developer Account ($99/年)
- Google Play Developer Account ($25 一時払い)
- アプリアイコン（1024x1024）
- スクリーンショット
- プライバシーポリシー
- 利用規約

---

## ✅ 推奨タスク

### 9. テストの実行（開発時）

**いつ**: コード変更後、毎回

```bash
# Lint check
npm run lint

# Tests
npm test

# Format check
npm run format:check
```

---

### 10. デバッグ画面での動作確認

**いつ**: 新機能追加後、UI変更後

```bash
# 1. アプリ起動
npm start

# 2. 「ウォッチリスト」タイトルを長押し

# 3. デバッグ画面で各機能をテスト
# - モックデータ生成
# - テスト通知送信
# - 状態確認
```

---

## 📊 進捗チェックリスト

実機テスト前に確認：

- [ ] **Phase 0-8**: すべて完了
- [ ] **npm ci**: クリーンインストール成功
- [ ] **npm run lint**: エラーなし
- [ ] **npm test**: 41テスト全てパス
- [ ] **Expo Go**: インストール済み
- [ ] **.env**: ファイル作成済み（モックモード）
- [ ] **実機テスト**: TESTING.mdのシナリオ実行
- [ ] **Push通知**: 動作確認（実機のみ）

本番運用前に確認：

- [ ] **OpenAI APIキー**: 取得・設定済み
- [ ] **本番モード**: EXPO_PUBLIC_MOCK_MODE=false
- [ ] **コスト見積もり**: API利用料金を確認
- [ ] **エラーハンドリング**: ネットワーク/API エラー対応
- [ ] **パフォーマンス**: 大量データでの動作確認
- [ ] **セキュリティ**: APIキーの安全な管理

---

## 🚫 やってはいけないこと

1. **APIキーをGitHubにコミット**: .envファイルは.gitignoreに含まれています
2. **本番モードで無制限テスト**: API利用料金が発生します
3. **シミュレータでPush通知テスト**: 実機のみ対応です
4. **lintエラーを無視**: 必ずnpm run lintで確認してください
5. **テストをスキップ**: npm testで全テストが通ることを確認してください

---

## 📝 まとめ

### 最低限必要なタスク（モックモード）

1. ✅ npm ci（依存関係インストール）
2. ✅ npm start（アプリ起動）
3. ✅ Expo Goでスキャン（実機テスト）
4. ✅ TESTING.mdのシナリオ実行

### 本番運用に必要なタスク

1. ✅ OpenAI APIキー取得・設定
2. ✅ .envでMOCK_MODE=false
3. ✅ 本番データでの動作確認
4. ✅ コスト監視

**現在の完了率: 約85%**

残りの15%は、本番運用とパフォーマンス最適化です。モックモードでの開発・テストは**完全に準備完了**しています！

---

**質問があれば、GitHubのIssueで！🎉**
