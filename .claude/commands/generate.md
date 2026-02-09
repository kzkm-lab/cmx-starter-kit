---
description: CMX スキーマから型付きコードを再生成する
disable-model-invocation: true
allowed-tools: Bash, Read, Glob
---

# コード生成

Admin 側でコレクション・データタイプを変更した後に実行する。

## 手順

### 1. 生成実行

```bash
npx cmx-sdk generate
```

### 2. 差分確認

`cmx/generated/` 配下の変更を確認し、以下を報告:
- 新規追加されたファイル
- 変更されたファイル（型定義の差分）
- 削除されたファイル

### 3. 影響確認

生成されたコードを使用しているページに影響がないか確認:
- 型が変わったフィールドがないか
- 削除されたフィールドを参照していないか
