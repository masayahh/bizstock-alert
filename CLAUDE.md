# CLAUDE.md — Guidance for Claude Code
## Health check
- 既定: `npm ci && npm run lint && npm test`
## Output order
- Plan → Patches → Test → Docs（PR本文・CHANGELOG）
## Rules
- 型の厳格化、any恒久化禁止、例外はユーザー静かな通知＋ログ集約
- 秘密情報は提案のみ（実体は人間が用意）
