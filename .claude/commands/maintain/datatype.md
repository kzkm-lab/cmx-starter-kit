---
description: 新しいデータタイプを追加する（スキーマ → Admin 登録 → コード生成 → ページ実装まで一貫）
argument-hint: [データタイプの用途や名前]
---

# データタイプ追加

**使用するスキル: cmx-schema → cmx-dev**

## 参照

- @cmx/site-config.md（サイト方針との整合性を確認）

## 手順

入力: $ARGUMENTS

### Step 1: スキーマ定義 & 登録

**スキル: cmx-schema** を使用。

site-config.md のサイト種別に合ったデータ構造を提案。

**1-0. グローバル vs コレクション付属**

データタイプには2種類ある:
- **グローバルデータタイプ**: コレクションに紐づかない（スタッフ、FAQ等）→ このコマンドで作成
- **コレクション付属データタイプ**: 特定コレクションに紐づく（カテゴリ、タグ等）→ `/maintain/collection` で管理

コレクションのカテゴリやタグを追加したい場合は `/maintain/collection` を使用すること。

**1-1. 既存データタイプの確認**

```bash
npx cmx-sdk list-data-types
```

既存データと重複がないことを確認する。

**1-2. JSON生成とユーザー確認**

```
以下のデータタイプを作成します:

- 名前: {name}
- スラッグ: {slug}
- フィールド数: {n}

重複はありません。こちらで登録してもよろしいですか？
```

**1-3. cmx-sdk で登録**

承認されたら、`cmx-sdk` コマンドで登録:

**通常）カスタムフィールドで登録:**
```bash
npx cmx-sdk create-data-type --json '{"slug":"{slug}","name":"{name}","description":"{description}","fields":[...]}'
```

公開/非公開の制御が必要な場合は、fields に以下を追加:
```json
{"key":"published","label":"公開","type":"boolean","required":true,"defaultValue":false}
```

**参考例）プリセートを使用する場合:**
```bash
# staff プリセート（スタッフ情報の例）
npx cmx-sdk create-data-type --json '{"slug":"staff","name":"スタッフ","presetSlug":"staff"}'

# locations プリセート（場所・施設情報の例）
npx cmx-sdk create-data-type --json '{"slug":"locations","name":"ロケーション","presetSlug":"locations"}'
```

### Step 2: テストデータ

Admin 側で数件のエントリを作成するよう案内。

### Step 3: コード再生成 & ページ scaffold

```bash
npx cmx-sdk generate
npx cmx-sdk scaffold --only data-types:{slug}
```

生成コードの確認:
- `cmx/generated/data-types/{slug}.ts` — 型定義 + 取得関数
- `src/app/{slug}/page.tsx` — 一覧ページ雛形（scaffold）

### Step 4: ページカスタマイズ

scaffold で生成された雛形の HTML/CSS をカスタマイズ:

1. `src/app/{path}/page.tsx` — 一覧ページのデザイン調整
2. 必要に応じて詳細ページも作成

site-config.md のデザイン方針に沿ったスタイリングを行う。

### Step 5: ナビゲーション更新（必要な場合）

`src/components/layout/Header.tsx` にリンクを追加。

### Step 6: 動作確認

開発サーバーでページの表示を確認する。
