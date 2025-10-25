# BizStock Alert - 超簡単スタートガイド

**5分で動かせます！**

---

## 🚀 Windows での起動方法

### Step 1: ターミナルを開く

1. `Win` + `R` キーを押す
2. `cmd` と入力して Enter
3. 黒い画面（コマンドプロンプト）が開く

### Step 2: プロジェクトに移動

```cmd
cd C:\Users\YourName\bizstock-alert
```

（自分のプロジェクトパスに変更してください）

### Step 3: 起動！

```cmd
npm start
```

5-10秒待つと、こんな画面が出ます：

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
```

### Step 4: ブラウザで開く

キーボードで **`w`** を押す → 自動でブラウザが開く！

---

## 🍎 Mac での起動方法

### Step 1: ターミナルを開く

1. `Command` + `Space` でSpotlight検索
2. `terminal` と入力
3. ターミナルが開く

### Step 2: プロジェクトに移動

```bash
cd ~/bizstock-alert
```

### Step 3: 起動！

```bash
npm start
```

### Step 4: ブラウザで開く

キーボードで **`w`** を押す → Safari/Chromeが開く！

---

## 🐧 Linux での起動方法

### Step 1: ターミナルを開く

`Ctrl` + `Alt` + `T`

### Step 2: プロジェクトに移動

```bash
cd ~/bizstock-alert
```

### Step 3: 起動！

```bash
npm start
```

### Step 4: ブラウザで開く

キーボードで **`w`** を押す → ブラウザが開く！

---

## 📱 ブラウザで表示されたら

### やってみること

1. **ティッカー追加**
   - 入力欄に `7203` と入力
   - 「追加」をクリック

2. **デバッグメニュー**
   - 「ウォッチリスト」の文字を長押し（クリック長押し）
   - デバッグ画面が開く

3. **モックデータ生成**
   - デバッグ画面で「Live Tileイベント生成 (3件)」をクリック
   - Live Tileにイベントが表示される

4. **イベント詳細**
   - Live Tileのイベントをクリック
   - 詳細画面（EventSheet）が表示される

5. **設定変更**
   - 画面を下にスクロール
   - 設定のトグルスイッチをON/OFF

---

## ❓ トラブルシューティング

### Q: `npm` コマンドが見つからない

**A**: Node.jsがインストールされていません。

1. https://nodejs.org/ にアクセス
2. LTS版をダウンロード＆インストール
3. ターミナルを再起動
4. もう一度 `npm start` を実行

---

### Q: `w` を押してもブラウザが開かない

**A**: 手動で開けます。

ブラウザのアドレスバーに入力：
```
http://localhost:19006
```

---

### Q: エラーメッセージが表示される

**A**: 依存関係を再インストールしてみてください。

```bash
# 1. クリーンアップ
rm -rf node_modules package-lock.json

# 2. 再インストール
npm install

# 3. 起動
npm start
```

---

### Q: 画面が真っ白

**A**: ブラウザのコンソールを確認。

1. ブラウザで `F12` を押す
2. 「Console」タブを見る
3. エラーメッセージをコピー
4. GitHubのIssueに報告

---

## 🎯 次のステップ

### Web版で満足したら...

#### より本格的なテスト（実機）

1. **Expo Go アプリをインストール**
   - iOS: App Store で「Expo Go」
   - Android: Google Play で「Expo Go」

2. **QRコードをスキャン**
   - `npm start` の画面に表示されるQRコード
   - スマホのExpo Goでスキャン

3. **実機でテスト**
   - Push通知も動作
   - より正確な動作確認

---

## 📊 Web版の制限

### ✅ 動作する機能
- ウォッチリスト管理
- Live Tile表示
- イベント詳細
- 設定画面
- デバッグ機能
- モックデータ生成

### ❌ 動作しない機能（実機のみ）
- Push通知
- 一部のネイティブ機能

---

## 🎉 完了！

**これでブラウザ上でアプリを確認できます！**

問題があれば、GitHubのIssueで質問してください：
https://github.com/masayahh/bizstock-alert/issues

---

**所要時間: 5分**
**難易度: ⭐☆☆☆☆（超簡単）**
