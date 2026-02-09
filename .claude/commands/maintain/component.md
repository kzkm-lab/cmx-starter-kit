---
description: カスタム MDX コンポーネントを追加
argument-hint: [コンポーネント名や用途]
---

# コンポーネント追加

**使用するスキル: cmx-component**

cmx-component スキルのワークフロー全体を実行する。

## 参照

- @cmx/site-config.md（デザイン方針を確認）

## 手順

入力: $ARGUMENTS

1. ヒアリング（用途・props・デザイン）— site-config.md の方針に沿った提案
2. `cmx/components/{name}.json` — JSON 定義作成
3. `src/components/custom/{Name}.tsx` — React 実装
4. `src/components/custom/index.ts` — エクスポート追加
5. `pnpm sync-components` — Admin に同期
6. cmx-component スキルのチェックリストで確認
