---
description: サイトコンフィグとスタイルガイドを更新する
argument-hint: [変更したいセクションや内容]
---

# サイトコンフィグ & スタイルガイド更新

`cmx/site-config.md` と `workflows/style-guide.md` の内容を更新します。

## 参照

- @cmx/site-config.md
- @workflows/style-guide.md

## 手順

### 1. 現在のコンフィグ読み込み

`cmx/site-config.md` と `workflows/style-guide.md` を読み込んで現状を把握する。

### 2. 変更箇所の特定

入力: $ARGUMENTS

- 引数あり → 該当セクションを特定して変更案を提示
- 引数なし → 全セクションを表示し、どこを変えたいか質問

### 3. 更新

ユーザーの指示に従い、**関連する両ファイル** を更新する:

| 変更内容 | 更新対象 |
|---------|---------|
| デザイン（カラー、フォント、レイアウト） | site-config.md のみ |
| トーン・雰囲気 | site-config.md + style-guide.md |
| 文体・呼称 | style-guide.md のみ |
| ブランド用語 | style-guide.md のみ |
| 禁止事項 | site-config.md + style-guide.md |
| コンテンツルール | site-config.md + style-guide.md |

### 4. 影響確認

コンフィグ変更後、既存コードへの影響を確認:

| 変更内容 | 影響箇所 |
|---------|---------|
| トーン変更 | 既存コンポーネントのテキスト、コンテンツルール |
| カラー変更 | `src/app/globals.css`、Tailwind 設定 |
| フォント変更 | `src/app/layout.tsx` のフォント定義 |
| デザイン方針変更 | レイアウトコンポーネント（Header/Footer） |
| 禁止事項変更 | 既存コードに違反箇所がないか |

影響がある場合は修正箇所をリストアップし、対応するか質問する。

**注意:** `workflows/style-guide.md` を更新した場合、ライターへの再配布が必要な旨をユーザーに通知する。
