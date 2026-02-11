---
description: サイトに必要なコレクション・データタイプを設計し、Admin にインポート可能な JSON を生成
argument-hint: [サイトの要件や必要なコンテンツ種別（省略可）]
---

# スキーマ設計

**使用するスキル: cmx-schema**

cmx-schema スキルを読み込み、そのガイドに従って JSON 定義を生成すること。

## 参照

- @cmx/site-config.md（サイト種別・方針を確認）
- cmx-schema スキルの references/field-types.md
- cmx-schema スキルの references/migration-scenarios.md

## 手順

### 1. サイト要件のヒアリング

入力: $ARGUMENTS

引数がある場合はそれを基に設計。ない場合は site-config.md のサイト種別から判断し、必要なコンテンツ種別をユーザーに質問する。

質問例:
- どんなコンテンツを管理したいですか？（記事、お知らせ、スタッフ紹介、FAQ 等）
- それぞれどんな項目（フィールド）が必要ですか？

### 2. コンテンツ種別の振り分け

AGENTS.md の判断基準に従う:
- MDX 本文を持つ → **コレクション**（type: post/page/doc/news）
  - コレクションには付属データタイプ（カテゴリ・タグ等）を紐づけ可能
  - CollectionType に応じたおすすめプリセットが自動提案される
- 構造化フィールドのみ → **グローバルデータタイプ**

### 3. JSON 定義の生成

cmx-schema スキルに従い、各コンテンツ種別の JSON を生成する。

### 4. スキーマ登録

生成した JSON を cmx-sdk CLI 経由で登録する。

**4-1. 既存データの確認**

まず既存のコレクション・データタイプを確認:

```bash
npx cmx-sdk list-collections
npx cmx-sdk list-data-types
```

既存データと重複がないことを確認する。

**4-2. 登録の確認**

ユーザーに確認:

```
以下のスキーマを Admin に登録します:

【コレクション】
- {name} ({slug}) — type: {type}

【データタイプ】
- {name} ({slug}) — フィールド数: {n}

重複はありません。こちらで登録してもよろしいですか？
```

**4-3. cmx-sdk で登録**

承認されたら、`cmx-sdk` コマンドで登録する。

コレクションの登録（プリセットデータタイプ付き）:
```bash
# dataTypes を指定してプリセットを選択。省略時はデフォルトが適用される
npx cmx-sdk create-collection --json '{"type":"post","slug":"blog","name":"ブログ","description":"ブログ記事","dataTypes":["categories","tags"]}'
```

プリセット一覧の確認:
```bash
npx cmx-sdk list-collection-presets --type post
```

グローバルデータタイプの登録:
```bash
npx cmx-sdk create-data-type --json '{"slug":"staff","name":"スタッフ","description":"スタッフ情報","fields":[...]}'
```

### 5. COLLECTION_SLUGS の更新

コレクションを追加した場合、`src/lib/constants/collections.ts` にスラッグを追加する。

### 6. テストデータの案内

Admin 側で各コレクション・データタイプに 2-3 件のテストデータを作成するよう案内する。
**重要: ステータスを「公開」にすること。** Public API は公開済みコンテンツのみ返す。

## 出力

```
スキーマ設計が完了しました。

コレクション:
- {name} ({slug}) — type: {type}

データタイプ:
- {name} ({slug}) — フィールド数: {n}

Admin UI でインポート・テストデータ作成が終わったら、
/setup/04_generate でコードを生成しましょう。
```
