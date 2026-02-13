# フィールドタイプリファレンス

## 一覧

| type | 説明 | options |
|------|------|---------|
| `text` | 単行テキスト | `maxLength`, `placeholder` |
| `textarea` | 複数行テキスト | `maxLength`, `placeholder` |
| `richtext` | リッチテキストエディタ | - |
| `number` | 数値 | `min`, `max`, `step` |
| `date` | 日付 | - |
| `datetime` | 日時 | - |
| `boolean` | 真偽値 | - |
| `select` | ドロップダウン選択 | `choices[]`, `multiple` |
| `multiselect` | 複数選択 | `choices[]` |
| `image` | 画像 | - |
| `file` | ファイル | - |
| `json` | JSONデータ | - |
| `url` | URL | - |
| `email` | メールアドレス | - |
| `relation` | 他データタイプへの参照 | `targetType` |

## options 詳細

```json
{
  "maxLength": 100,
  "placeholder": "入力してください",
  "min": 0,
  "max": 999,
  "step": 1,
  "choices": [
    { "value": "option1", "label": "選択肢1" },
    { "value": "option2", "label": "選択肢2" }
  ],
  "multiple": false,
  "targetType": "staff"
}
```

### text / textarea

- `maxLength` (number) — 最大文字数
- `placeholder` (string) — プレースホルダーテキスト

### number

- `min` (number) — 最小値
- `max` (number) — 最大値
- `step` (number) — ステップ値

### select

- `choices` (array) — `{ "value": "key", "label": "表示名" }` の配列
- `multiple` (boolean) — `true` で複数選択可

### relation

- `targetType` (string) — 参照先データタイプの slug

## defaultValue（デフォルト値）

フィールド定義に `defaultValue` を設定すると、エントリ作成時に値が未入力の場合に自動的に適用されます。

```json
{
  "key": "published",
  "label": "公開",
  "type": "boolean",
  "required": true,
  "defaultValue": false
}
```

**動作:**
- エントリ作成時、フィールドに値が指定されていない場合に `defaultValue` が適用される
- 明示的に `null` が指定された場合は `null` が保存される（デフォルト値は適用されない）
- 値の型は `type` と一致する必要がある（例: `boolean` フィールドに `"false"` は不可）

**使用例:**
- `published: false` — グローバルデータタイプで、デフォルトで非公開
- `status: "draft"` — ステータスフィールドで、デフォルトで下書き
- `order: 0` — ソート順フィールドで、デフォルトで0

## データタイプ JSON 例

### スタッフ

```json
{
  "slug": "staff",
  "name": "スタッフ",
  "description": "チームメンバー情報",
  "fields": [
    {
      "key": "name",
      "label": "名前",
      "type": "text",
      "required": true,
      "description": "フルネーム",
      "options": { "maxLength": 100 }
    },
    {
      "key": "position",
      "label": "役職",
      "type": "select",
      "options": {
        "choices": [
          { "value": "director", "label": "取締役" },
          { "value": "manager", "label": "マネージャー" },
          { "value": "engineer", "label": "エンジニア" }
        ]
      }
    },
    { "key": "bio", "label": "自己紹介", "type": "textarea", "options": { "maxLength": 500 } },
    { "key": "photo", "label": "写真", "type": "image" },
    { "key": "email", "label": "メールアドレス", "type": "email" }
  ]
}
```

### FAQ

```json
{
  "slug": "faq",
  "name": "よくある質問",
  "fields": [
    { "key": "question", "label": "質問", "type": "text", "required": true },
    { "key": "answer", "label": "回答", "type": "richtext", "required": true },
    {
      "key": "category",
      "label": "カテゴリ",
      "type": "select",
      "options": {
        "choices": [
          { "value": "general", "label": "一般" },
          { "value": "pricing", "label": "料金" },
          { "value": "technical", "label": "技術" }
        ]
      }
    },
    { "key": "is_featured", "label": "注目", "type": "boolean" }
  ]
}
```

### 実績・事例

```json
{
  "slug": "case-studies",
  "name": "実績・事例",
  "description": "導入事例や制作実績",
  "fields": [
    { "key": "title", "label": "タイトル", "type": "text", "required": true },
    { "key": "client", "label": "クライアント名", "type": "text" },
    { "key": "description", "label": "概要", "type": "textarea" },
    { "key": "thumbnail", "label": "サムネイル", "type": "image" },
    { "key": "url", "label": "サイトURL", "type": "url" },
    { "key": "published_date", "label": "公開日", "type": "date" }
  ]
}
```
