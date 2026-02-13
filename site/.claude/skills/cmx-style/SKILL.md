---
name: cmx-style
description: |
  CMX Starter Kit のスタイル・デザイン変更スキル。CSS 変数、フォント、レイアウト、カラーの変更パターンと site-config.md との連動。
  トリガー: 「スタイルを変更」「デザインを変えたい」「色を変更」「フォントを変更」
  「レイアウトを変更」「ヘッダーを修正」「フッターを修正」「ダークモード」
  「余白を調整」「見た目を変えたい」など。
---

# CMX スタイル変更

## 事前確認

変更前に必ず `cmx/site-config.md` のデザイン方針セクションを読み、変更が方針と矛盾しないか確認する。矛盾する場合はコンフィグの更新も提案すること。

## 変更対象と対応ファイル

| 変更内容 | 対象ファイル |
|---------|------------|
| カラー（テーマ色、背景色等） | `src/app/globals.css` |
| フォント | `src/app/layout.tsx` |
| Header | `src/components/layout/Header.tsx` |
| Footer | `src/components/layout/Footer.tsx` |
| MDX 記事のスタイル | `src/app/globals.css`（`.prose` カスタマイズ） |
| コンポーネントスタイル | 該当 TSX ファイル |
| 全体的なスペーシング | `src/app/globals.css` |

## パターン別ガイド

詳細は [references/style-patterns.md](references/style-patterns.md) を参照。

### カラー変更

`src/app/globals.css` の CSS 変数を修正。shadcn/ui のテーマ変数体系に従う。

### フォント変更

`src/app/layout.tsx` の `next/font/google` インポートを変更。CSS 変数でフォントファミリーを指定。

### レイアウト変更

Header/Footer は `src/components/layout/` 配下。ナビゲーション項目、ロゴ、カラムレイアウトを修正。

## 変更後

1. 開発サーバーで全ページの表示を確認
2. レスポンシブ（モバイル/タブレット/デスクトップ）を確認
3. `cmx/site-config.md` のデザイン方針セクションを更新して同期
