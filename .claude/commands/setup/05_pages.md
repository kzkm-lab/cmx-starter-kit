---
description: コレクション・データタイプのページを実装
argument-hint: [対象のスラッグ（省略可→全て対象）]
---

# ページ実装

**使用するスキル: cmx-dev**

cmx-dev スキルを読み込み、テンプレートパターンに従って実装すること。

## 参照

- @cmx/site-config.md（デザイン方針を確認）
- cmx-dev スキルの references/api-patterns.md

## 手順

### 1. 実装対象の特定

入力: $ARGUMENTS

引数なし → `cmx/generated/` と `src/lib/constants/collections.ts` から未実装のコレクション・データタイプを一覧表示し、どれから作るか質問。

引数あり → 指定されたスラッグのページを実装。

### 2. ページ種別の判定と実装

cmx-dev スキルのタスク判定ツリーに従う:

- **コレクション** → 一覧ページ + 詳細ページ（MDX レンダリング付き）
- **データタイプ** → 一覧ページ（+ 必要に応じて詳細ページ）
- **静的ページ** → CMX API 不使用のページ

site-config.md のデザイン方針・トーンに沿ったスタイリングを行う。

### 3. ナビゲーション更新

`src/components/layout/Header.tsx` にリンクを追加。

### 4. 動作確認

開発サーバーでページの表示を確認する。

## 出力

```
ページ実装が完了しました。

作成したページ:
- /{slug} — 一覧ページ
- /{slug}/[slug] — 詳細ページ

次のステップ:
- MDX コンポーネントが必要なら /setup/06_components
- このまま公開なら /setup/07_deploy
```
