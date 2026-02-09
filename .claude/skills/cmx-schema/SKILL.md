---
name: cmx-schema
description: |
  CMXのデータタイプ・コレクションのJSON定義を生成し、Admin UIの「JSONからインポート」で読み込む。
  既存サイトのデータ構造をCMXに移行する際のスキーマ変換・定義生成を担う。
  トリガー: 「スキーマを生成」「データタイプのJSON」「コレクションのJSON」「移行用のスキーマ」
  「CMXにインポートするJSON」「データ構造を定義」「サイトを移行」「データタイプを作りたい」
  「コレクションを追加したい」「フィールド定義」「JSON定義」「インポート用JSON」
---

# CMX スキーマ JSON 生成ガイド

既存サイトのデータ構造をCMXに移行するためのJSON定義を生成する。
生成したJSONは、CMX Admin UIの「JSONからインポート」機能で読み込む。

## タスク判定

- **フィールドタイプの詳細やオプションを確認** → [references/field-types.md](references/field-types.md)
- **サイト種別ごとの構成例が必要** → [references/migration-scenarios.md](references/migration-scenarios.md)

## データタイプ JSON

```json
{
  "slug": "英数字-ハイフン",
  "name": "表示名",
  "description": "説明（任意）",
  "fields": [
    {
      "key": "英数字_アンダースコア",
      "label": "表示ラベル",
      "type": "text",
      "required": true,
      "description": "ヘルプテキスト（任意）",
      "options": {}
    }
  ]
}
```

フィールドの `type` は `text`, `textarea`, `richtext`, `number`, `date`, `datetime`, `boolean`, `select`, `multiselect`, `image`, `file`, `json`, `url`, `email`, `relation` のいずれか。各タイプの `options` 詳細は [references/field-types.md](references/field-types.md) を参照。

## コレクション JSON

```json
{
  "type": "post",
  "slug": "英数字-ハイフン",
  "name": "表示名",
  "description": "説明（任意）"
}
```

`type` の選択:

| type | 用途 |
|------|------|
| `post` | ブログ、コラム（時系列コンテンツ） |
| `page` | 固定ページ（会社概要、サービス紹介） |
| `doc` | ドキュメント（ツリー構造、マニュアル） |
| `news` | ニュース、お知らせ |

## インポート手順

1. JSON定義を生成してユーザーに出力
2. CMX Admin UI を開く
3. データタイプ: 設定 → データタイプ → 新規作成 → 「JSONからインポート」
4. コレクション: 設定 → コレクション → 「JSONからインポート」
5. JSONを貼り付けて「インポート」→ フォームに自動入力 → 確認・編集 → 保存
