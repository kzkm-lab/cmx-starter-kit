---
name: cmx-form
description: |
  CMX Starter Kit のフォーム実装スキル。Admin 側フォーム定義からフロント UI、submissions API 送信、バリデーション、スパム対策までの一貫ワークフロー。
  トリガー: 「フォームを作りたい」「お問い合わせ」「コンタクトフォーム」「送信機能」
  「フォームを追加」「submissions」「フォームバリデーション」など。
---

# CMX フォーム実装

## ワークフロー

### 1. フォーム設計

ユーザーに確認:
- 用途（お問い合わせ、資料請求、予約等）
- 必要なフィールドと種類
- バリデーション要件
- 送信後の挙動（サンクスメッセージ、リダイレクト）

### 2. Admin 側フォーム定義

**2-1. 既存フォームの確認**

まず既存のフォーム定義を確認して、重複がないことを確認:

```bash
npx cmx-sdk list-forms
```

**2-2. JSON生成とユーザー確認**

フォーム定義 JSON を生成し、ユーザーに確認:

```
以下のフォームを Admin に登録します:

- 名前: {name}
- スラッグ: {slug}
- フィールド数: {n}

重複はありません。こちらで登録してもよろしいですか？
```

**2-3. cmx-sdk で登録**

承認されたら、`cmx-sdk` コマンドで登録:

```bash
npx cmx-sdk create-form --json '{
  "slug": "contact",
  "name": "お問い合わせ",
  "description": "お問い合わせフォーム",
  "fields": [
    {"key": "name", "label": "お名前", "type": "text", "required": true},
    {"key": "email", "label": "メールアドレス", "type": "email", "required": true},
    {"key": "message", "label": "メッセージ", "type": "textarea", "required": true}
  ]
}'
```

### 3. フロント実装

クライアントコンポーネント（`"use client"`）として作成。

テンプレート: [references/form-template.md](references/form-template.md)

実装ポイント:
- `useState` でフォーム状態・送信状態・エラーを管理
- Zod スキーマでクライアントバリデーション
- ハニーポットフィールド（`_hp`）を隠しフィールドとして設置
- `POST /api/v1/sdk/submissions/{formSlug}` に送信
- 送信は `cmx-sdk` の関数 or 直接 fetch（APIキーは不要、公開エンドポイント）

### 4. 送信処理

```tsx
const response = await fetch(`${process.env.NEXT_PUBLIC_CMX_API_URL}/api/v1/sdk/submissions/${formSlug}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...formData, _hp: honeypotValue }),
})
```

- `_hp` フィールドが空でない場合、サーバー側でスパムとして弾く
- 成功: 200 → サンクスメッセージ表示
- エラー: 4xx/5xx → エラーメッセージ表示

### 5. 動作確認

- フォーム送信テスト
- Admin 側で送信一覧に表示されることを確認
- バリデーションエラーの表示を確認
- ハニーポットが機能することを確認

## チェックリスト

- [ ] クライアントコンポーネント（`"use client"`）として作成
- [ ] Zod バリデーション
- [ ] ハニーポットフィールド（`_hp`）設置
- [ ] 送信中・成功・エラーの UI 状態
- [ ] site-config.md のトーン・デザインに沿ったスタイリング
- [ ] アクセシビリティ（label、aria、エラーメッセージの関連付け）
