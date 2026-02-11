# 移行シナリオ別ガイド

サイト種別ごとに、よく使われるデータタイプとコレクションの構成例。

## コーポレートサイト

データタイプ:
- `staff` — メンバー紹介（name, position, bio, photo）
- `service` — サービス紹介（title, description, icon, features）
- `faq` — よくある質問（question, answer, category）
- `testimonial` — お客様の声（name, company, content, rating）

コレクション:
- `news` type=news: お知らせ
- `page` type=page: 会社概要、アクセス等

## LP（ランディングページ）

データタイプ:
- `feature` — 機能紹介（title, description, icon）
- `pricing` — 料金プラン（name, price, features, is_popular）
- `testimonial` — 利用者の声（name, company, content）
- `cta` — CTAセクション（title, description, button_text, button_url）

## ブログ・メディア

コレクション:
- `post` type=post: 記事（blog, column, interview等）
  - フロントマター: title, description, category, tags, published_at
  - **category と tags はフロントマターに直接記述（データタイプ不要）**

データタイプ:
- `author` — 著者情報（name, bio, avatar, social_links）

## ECサイト

データタイプ:
- `product` — 商品（name, price, description, image, category）
- `category` — カテゴリ（name, slug, parent）
- `review` — レビュー（rating, content, author）

コレクション:
- `page` type=page: 特商法表記、プライバシーポリシー等
- `news` type=news: セール情報、新商品情報
