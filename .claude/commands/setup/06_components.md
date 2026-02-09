---
description: MDX 記事内で使えるカスタムコンポーネントを作成・同期
argument-hint: [コンポーネント名や用途（省略可）]
---

# カスタムコンポーネント作成

**使用するスキル: cmx-component**

cmx-component スキルを読み込み、そのワークフロー全体に従って作成すること。

## 参照

- @cmx/site-config.md（デザイン方針を確認）

## 手順

### 1. ヒアリング

入力: $ARGUMENTS

cmx-component スキルのヒアリングセクションに従い、用途・props・デザインを確認。
site-config.md のデザイン方針・トーンに沿った提案をする。

### 2. 3 ファイル作成

cmx-component スキルのワークフローに従い:
1. `cmx/components/{name}.json` — JSON 定義
2. `src/components/custom/{Name}.tsx` — React 実装
3. `src/components/custom/index.ts` — エクスポート追加

### 3. 同期

```bash
pnpm sync-components
```

### 4. チェックリスト

cmx-component スキルのチェックリストで全項目を確認。

## 出力

```
コンポーネントを作成しました。

- 定義: cmx/components/{name}.json
- 実装: src/components/custom/{Name}.tsx
- 同期: 完了

MDX 内で <{Name} prop="value" /> として使えます。

次のステップ:
- さらにコンポーネントを追加 → /setup/06_components
- デプロイ → /setup/07_deploy
```
