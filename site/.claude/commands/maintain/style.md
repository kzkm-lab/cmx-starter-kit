---
description: サイトのスタイル・デザインを変更する（色、フォント、レイアウト等）
argument-hint: [変更したい内容]
---

# スタイル変更

**使用するスキル: cmx-style**

cmx-style スキルを読み込み、そのパターンに従って変更すること。

## 参照

- @cmx/site-config.md（現在のデザイン方針を確認）

## 手順

入力: $ARGUMENTS

### 1. site-config.md の確認

現在のデザイン方針を読み込み、変更がコンフィグと矛盾しないか確認。
矛盾する場合はコンフィグの更新も提案する。

### 2. 変更対象の特定

| 変更内容 | 対象ファイル |
|---------|------------|
| カラー | `src/app/globals.css` の CSS 変数 |
| フォント | `src/app/layout.tsx` のフォント定義 |
| レイアウト | `src/components/layout/` の Header/Footer |
| コンポーネントスタイル | 該当 TSX ファイル |
| 全体的なスペーシング | `src/app/globals.css` |

### 3. 実装

**スキル: cmx-style** のパターンに従って変更を実施。

### 4. site-config.md の同期

デザイン方針に変更があれば `cmx/site-config.md` のデザイン方針セクションも更新する。

### 5. 動作確認

開発サーバーで変更の表示を確認する。
