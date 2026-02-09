---
description: CMX API を使わない静的ページを追加
argument-hint: [ページのパスや用途]
---

# 静的ページ追加

**使用するスキル: cmx-dev**（静的ページ作成パターン）

## 参照

- @cmx/site-config.md（デザイン方針・トーンを確認）

## 手順

入力: $ARGUMENTS

### 1. ページ作成

cmx-dev スキルの静的ページ作成パターンに従い:
- `src/app/{path}/page.tsx` を作成
- メタデータ（`export const metadata`）を設定
- site-config.md のデザイン方針・トーンに沿ったコンテンツ・スタイリング

### 2. ナビゲーション更新（必要な場合）

`src/components/layout/Header.tsx` にリンクを追加。

### 3. 動作確認

開発サーバーでページの表示を確認する。
