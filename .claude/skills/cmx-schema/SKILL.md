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
  "description": "説明（任意）",
  "dataTypes": ["categories", "tags"]
}
```

`type` の選択:

| type | 用途 | おすすめデータタイプ | フロントマターフィールド |
|------|------|---------------------|------------------------|
| `post` | ブログ、コラム（時系列コンテンツ） | カテゴリ、タグ、著者、連載 | title, description, published_at, locale |
| `page` | 固定ページ（会社概要、サービス紹介） | なし | title, description, locale |
| `doc` | ドキュメント（ツリー構造、マニュアル） | なし | title, description, order, locale |
| `news` | ニュース、お知らせ | カテゴリ | title, description, published_at, expires_at, important, locale |

### 付属データタイプ（プリセット）

コレクション作成時に `dataTypes` フィールドでプリセットslugの配列を指定すると、対応するデータタイプが自動作成される。省略時はそのCollectionTypeのデフォルトプリセットが適用される。

利用可能なプリセット:

| slug | 名前 | 選択方式 | デフォルト（post） | デフォルト（news） |
|------|------|---------|-----------------|-----------------|
| `categories` | カテゴリ | 単一選択 | ✅ | ✅ |
| `tags` | タグ | 複数選択 | ✅ | - |
| `authors` | 著者 | 単一選択 | - | - |
| `series` | 連載 | 単一選択 | - | - |

プリセット一覧を確認:
```bash
npx cmx-sdk list-collection-presets --type post
```

データタイプ不要（`doc`, `page` 等）の場合は空配列 `"dataTypes": []` を指定。

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

**コレクションの登録（プリセットデータタイプ付き）:**
```bash
npx cmx-sdk create-collection --json '{"type":"post","slug":"blog","name":"ブログ","description":"ブログ記事を管理","dataTypes":["categories","tags"]}'
```

コレクション作成時にプリセットが自動適用され、`blog-categories`、`blog-tags` などのデータタイプが自動作成される。

**コレクションの付属データタイプを後から追加:**
```bash
# プリセットから追加
npx cmx-sdk add-collection-data-type --collection blog --preset authors

# カスタムで追加
npx cmx-sdk add-collection-data-type --collection blog --json '{"slug":"custom-field","name":"カスタム","referenceType":"single","fields":[{"key":"name","label":"名前","type":"text","required":true}]}'
```

**グローバルデータタイプの登録:**
```bash
# カスタムフィールドで登録（推奨）
npx cmx-sdk create-data-type --json '{"slug":"products","name":"商品","description":"商品情報","fields":[{"key":"name","label":"名前","type":"text","required":true},{"key":"published","label":"公開","type":"boolean","required":true,"defaultValue":false}]}'

# プリセートを使用する場合（参考例）
npx cmx-sdk create-data-type --json '{"slug":"staff","name":"スタッフ","presetSlug":"staff"}'
```

### グローバルプリセット（参考例）

参考として以下のプリセートが用意されていますが、**カスタムフィールドで自由に定義することを推奨**します。

| slug | フィールド例 | 用途例 |
|------|----------|------|
| `staff` | name, role, bio, avatar, email, published | スタッフ情報、チームメンバー紹介 |
| `locations` | name, address, description, latitude, longitude, image, published | 店舗・施設情報、アクセスマップ |

**公開/非公開の制御:**
- グローバルデータタイプは公開サイトに直接表示されるため、`published` フィールド（boolean）で公開/非公開を制御するのが一般的
- コレクションに紐付くデータタイプ（categories, tags, authors）はコンテンツの公開ステータスで制御されるため、`published` フィールドは不要

