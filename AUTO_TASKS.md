Goal: App.tsx の重複レンダーを解消（FlatListへ統一）し、EventSheet を最小モーダルで実装。CIを緑で維持。
Acceptance:
- [ ] 重複表示が消える（FlatListのみ）
- [ ] EventSheet が開閉できる
- [ ] __tests__/ai-apply.test.ts を追加して PASS
Touched files:
- App.tsx
- src/components/EventSheet.tsx
- __tests__/ai-apply.test.ts
