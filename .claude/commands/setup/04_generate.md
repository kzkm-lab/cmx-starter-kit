---
description: CMX スキーマから型付き TypeScript コードとページ雛形を生成
disable-model-invocation: true
allowed-tools: Bash, Read, Glob
---

# コード生成 & ページ scaffold

## 手順

### 1. コード生成（冪等 — 何度でも再実行可能）

```bash
npx cmx-sdk generate
```

### 2. 生成結果の確認

`cmx/generated/` 配下に生成されたファイルを確認し、以下を報告:
- コレクション: `get{Name}Posts()`, `get{Name}PostDetail()`
- データタイプ: `{Name}` 型定義, `get{Name}()`, `get{Name}ById()`
- フォーム: `{name}Schema` (Zod), `{Name}FormData` (型), `submit{Name}()` (送信関数)

### 3. ページ scaffold（初回のみ — 既存ファイルは上書きしない）

```bash
npx cmx-sdk scaffold
```

### 4. scaffold 結果の確認

`src/app/` 配下に生成されたページファイルを確認し、以下を報告:
- コレクション一覧・詳細ページ
- データタイプ一覧ページ
- フォームページ + クライアントコンポーネント
- sitemap.ts

### 5. 差分報告

新規追加・変更されたファイルと型定義の要約を表示する。

## 出力

```
コード生成 & scaffold が完了しました。

生成されたファイル:
- cmx/generated/collections/{slug}.ts
- cmx/generated/data-types/{slug}.ts
- cmx/generated/forms/{slug}.ts
- src/app/{slug}/page.tsx（scaffold）

次のステップ: /setup/05_pages で各ページのデザインをカスタマイズしましょう。
```
