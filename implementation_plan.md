# Implementation Plan: 即興デモ機能（能力ショーケースカード v2）

## 目的
前回のシンプル表示から一段進め、ホーム画面で「今どれだけ危険/注目か」を即断できる分析カードへ強化する。

## スコープ（小PR 1本）
1. **分析ロジック強化**
   - 既存の top ticker / impact 分布に加えて以下を追加。
     - confidence score（0-100）
     - 直近3時間イベント件数（recency hot count）
     - 通知未読率（unread rate）
     - alert mode（IMMEDIATE / WATCH / QUIET）
     - evidence points（根拠3行）
2. **UI改善**
   - Capability Showcase card に confidenceバー、alert mode、根拠リストを追加。
3. **テスト拡充**
   - 既存テストを拡張し、未読率と recency 起点のモード切替を検証。
4. **検証**
   - lint / 対象テストを実行して回帰なしを確認。

## リスク
- スコアはヒューリスティックであり絶対指標ではない。
- recency 判定はクライアント時刻依存のため、将来的にはサーバ時刻同期が望ましい。
