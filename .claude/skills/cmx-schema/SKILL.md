---
name: cmx-schema
description: |
  CMXのデータタイプ・コレクションのJSON定義を生成し、cmx-sdk CLI（またはAdmin UI）で登録する。
  既存サイトのデータ構造をCMXに移行する際のスキーマ変換・定義生成を担う。
  トリガー: 「スキーマを生成」「データタイプのJSON」「コレクションのJSON」「移行用のスキーマ」
  「CMXにインポートするJSON」「データ構造を定義」「サイトを移行」「データタイプを作りたい」
  「コレクションを追加したい」「フィールド定義」「JSON定義」「インポート用JSON」
---

# CMX スキーマ JSON 生成ガイド

既存サイトのデータ構造をCMXに移行するためのJSON定義を生成する。
生成したJSONは `npx cmx-sdk` コマンド（推奨）または Admin UI の「JSONからインポート」で登録する。

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

## 登録手順

### 方法 1（推奨）: cmx-sdk コマンドで API 経由登録

```bash
# コレクション単体
npx cmx-sdk create-collection --json '{"type":"post","slug":"blog","name":"ブログ"}'

# データタイプ単体
npx cmx-sdk create-data-type --json '{"slug":"staff","name":"スタッフ","fields":[...]}'

# まとめてインポート（JSON ファイル）
npx cmx-sdk import-schema --file schema.json
```

import-schema の JSON 形式:
```json
{
  "collections": [
    { "type": "post", "slug": "blog", "name": "ブログ" }
  ],
  "dataTypes": [
    { "slug": "staff", "name": "スタッフ", "fields": [...] }
  ]
}
```

### 方法 2: Admin UI で手動登録

1. CMX Admin UI を開く
2. データタイプ: 設定 → データタイプ → 新規作成 → 「JSONからインポート」
3. コレクション: 設定 → コレクション → 「JSONからインポート」
4. JSONを貼り付けて「インポート」→ フォームに自動入力 → 確認・編集 → 保存
