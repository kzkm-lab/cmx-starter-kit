---
description: カスタムコンポーネントを Admin に同期する
argument-hint: [環境: production|staging（省略可→自動判定）]
disable-model-invocation: true
allowed-tools: Bash, Read, Glob
---

# コンポーネント同期

`cmx/components/` の JSON 定義を CMX Admin に同期する。

## 手順

### 1. 同期前チェック

`cmx/components/` 内の JSON ファイルと `src/components/custom/index.ts` のエクスポートが一致しているか確認。
不一致がある場合は警告を出す。

### 2. 同期実行

入力: $ARGUMENTS

```bash
pnpm sync-components $ARGUMENTS
```

引数なし → ブランチから環境を自動判定（main=production, develop=staging）

### 3. 結果確認

同期されたコンポーネント一覧を報告する。
