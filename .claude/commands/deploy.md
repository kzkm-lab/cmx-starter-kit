---
description: Cloudflare Workers へデプロイする
argument-hint: [staging|production（省略可）]
disable-model-invocation: true
allowed-tools: Bash, Read, Glob
---

# デプロイ

## 手順

### 1. 事前チェック

```bash
pnpm typecheck
pnpm lint
```

エラーがあれば修正を提案する。

### 2. ビルド & デプロイ

```bash
pnpm build:cf && pnpm deploy
```

### 3. 事後確認

- デプロイ URL を報告
- `/api/health` のヘルスチェック
