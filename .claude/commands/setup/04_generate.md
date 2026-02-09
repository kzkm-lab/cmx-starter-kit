---
description: CMX スキーマから型付き TypeScript コードを生成
disable-model-invocation: true
allowed-tools: Bash, Read, Glob
---

# コード生成

## 手順

### 1. 生成実行

```bash
npx cmx-sdk generate
```

### 2. 生成結果の確認

`cmx/generated/` 配下に生成されたファイルを確認し、以下を報告:
- コレクション: `get{Name}Posts()`, `get{Name}PostDetail()`
- データタイプ: `{Name}` 型定義, `get{Name}()`, `get{Name}ById()`

### 3. 差分報告

新規追加・変更されたファイルと型定義の要約を表示する。

## 出力

```
コード生成が完了しました。

生成されたファイル:
- cmx/generated/collections/{slug}.ts
- cmx/generated/data-types/{slug}.ts

次のステップ: /setup/05_pages でページを実装しましょう。
```
