---
description: お問い合わせ等のフォームを追加する（Admin 定義 → フロント UI → 送信処理）
argument-hint: [フォームの用途]
---

# フォーム追加

**使用するスキル: cmx-form**

cmx-form スキルを読み込み、そのワークフローに従って実装すること。

## 参照

- @cmx/site-config.md（トーン・コンテンツルールを確認）

## 手順

入力: $ARGUMENTS

### Step 1: フォーム設計

ユーザーに確認:
- フォームの目的（お問い合わせ、資料請求、予約等）
- 必要なフィールドと種類
- バリデーション要件

site-config.md のトーンに合わせたラベル・プレースホルダー・エラーメッセージを設計。

### Step 2: Admin 側フォーム定義

フォーム定義 JSON を生成し、Admin UI での登録手順を案内:
- 設定 → フォーム → 新規作成

### Step 3: コード再生成 & ページ scaffold

```bash
npx cmx-sdk generate
npx cmx-sdk scaffold --only forms:{slug}
```

生成コードの確認:
- `cmx/generated/forms/{slug}.ts` — Zod スキーマ + 型定義 + 送信関数
- `src/app/{slug}/page.tsx` — フォームページ雛形（scaffold）
- `src/app/{slug}/_components/{slug}-form.tsx` — フォーム Client Component（scaffold）

### Step 4: フォーム UI カスタマイズ

scaffold で生成された雛形をカスタマイズ:
- フォーム UI（site-config.md のデザイン方針に沿う）
- バリデーションは生成済み Zod スキーマ（`cmx/generated/forms/` 内）を使用
- 送信処理は生成済み `submit{Name}()` 関数を使用
- ハニーポットフィールド（`_hp`）は scaffold で自動追加済み
- 送信成功・エラーの UX をカスタマイズ

### Step 4: 動作確認

送信テスト → Admin 側で受信確認を案内。
