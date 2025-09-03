# AGENTS.md — Project-wide rules for coding agents
## Project
- Name: BizStock Alert
- Stack: React Native (Expo), TypeScript, Redux Toolkit
- Node: LTS / npm
## Goals
- 15分遅延の株価・ニュース要約配信。段階的ロールアウト。
## Conventions
- Lint: eslint + @typescript-eslint
- Format: prettier (pre-commit推奨)
- Commits: Conventional Commits
- Branch: feat/*, fix/*, chore/*; mainは保護
- Tests: jest + @testing-library/react-native
## PR Policy
- 1 PR = 1 目的（要約/背景/実装/テスト/リスク）
## Agent Coordination
- 広範探索/分割計画は Codex
- ターミナル/重ビルド/リファクタは Claude Code
- まず `implementation_plan.md` を生成→小PRに分割
