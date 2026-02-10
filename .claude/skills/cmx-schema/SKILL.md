---
name: cmx-schema
description: |
  CMXのデータタイプ・コレクションのJSON定義を生成し、Admin API 経由で自動登録する。
  既存サイトのデータ構造をCMXに移行する際のスキーマ変換・定義生成を担う。
  トリガー: 「スキーマを生成」「データタイプのJSON」「コレクションのJSON」「移行用のスキーマ」
  「CMXにインポートするJSON」「データ構造を定義」「サイトを移行」「データタイプを作りたい」
  「コレクションを追加したい」「フィールド定義」「JSON定義」「インポート用JSON」
---

# CMX スキーマ JSON 生成ガイド

既存サイトのデータ構造をCMXに移行するためのJSON定義を生成する。
生成したJSONは、ユーザーに確認後、Admin API 経由で自動登録する。

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

### 1. JSON定義の生成

要件に基づいてコレクションまたはデータタイプのJSON定義を生成する。

### 2. 既存データの確認

まず既存のコレクション・データタイプを確認して、重複がないことを確認:

```bash
npx cmx-sdk list-collections
npx cmx-sdk list-data-types
```

### 3. ユーザーへの確認

生成したJSON定義をユーザーに提示し、登録の承認を得る:

```
以下のスキーマを Admin に登録します:

【コレクション】
- {name} ({slug}) — type: {type}

【データタイプ】
- {name} ({slug}) — フィールド数: {n}

重複はありません。こちらで登録してもよろしいですか？
```

### 4. cmx-sdk で登録

承認されたら、`cmx-sdk` コマンドで登録する。

**コレクションの登録:**
```bash
npx cmx-sdk create-collection --json '{"type":"post","slug":"blog","name":"ブログ","description":"ブログ記事を管理"}'
```

**データタイプの登録:**
```bash
npx cmx-sdk create-data-type --json '{"slug":"staff","name":"スタッフ","description":"スタッフ情報","fields":[{"key":"name","label":"名前","type":"text","required":true}]}'
```

**一括登録（推奨）:**
schema.json ファイルを作成して一括登録:
```bash
npx cmx-sdk import-schema --file schema.json
```
