# スタイル変更パターン

## カラー変更

`src/app/globals.css` の `:root` と `.dark` で CSS 変数を定義。shadcn/ui 体系:

```css
:root {
  --background: 0 0% 100%;           /* 背景色 */
  --foreground: 222.2 84% 4.9%;      /* テキスト色 */
  --card: 0 0% 100%;                 /* カード背景 */
  --card-foreground: 222.2 84% 4.9%; /* カードテキスト */
  --primary: 222.2 47.4% 11.2%;      /* プライマリ */
  --primary-foreground: 210 40% 98%; /* プライマリ上のテキスト */
  --secondary: 210 40% 96.1%;        /* セカンダリ */
  --muted: 210 40% 96.1%;            /* 控えめな背景 */
  --muted-foreground: 215.4 16.3% 46.9%; /* 控えめなテキスト */
  --accent: 210 40% 96.1%;           /* アクセント */
  --destructive: 0 84.2% 60.2%;      /* 削除・エラー */
  --border: 214.3 31.8% 91.4%;       /* ボーダー */
  --ring: 222.2 84% 4.9%;            /* フォーカスリング */
  --radius: 0.5rem;                  /* 角丸 */
}
```

値は HSL 形式（`hue saturation% lightness%`）。Tailwind で `bg-primary` のように使用される。

## フォント変更

`src/app/layout.tsx` で Google Fonts を読み込み:

```tsx
import { Inter, Noto_Sans_JP } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
})

// <body> に className で適用
<body className={`${inter.variable} ${notoSansJP.variable} font-sans`}>
```

`globals.css` でフォントファミリーを定義:

```css
:root {
  --font-sans: var(--font-inter), var(--font-noto-sans-jp), sans-serif;
  --font-mono: var(--font-geist-mono), monospace;
}
```

## Header カスタマイズ

`src/components/layout/Header.tsx`:

```tsx
const navItems = [
  { href: "/blog", label: "ブログ" },
  { href: "/news", label: "ニュース" },
  { href: "/about", label: "企業情報" },
]
```

- ナビ項目の追加・削除・順序変更
- ロゴの変更（テキスト or 画像）
- スティッキーヘッダーの有無
- モバイルメニューの挙動

## Footer カスタマイズ

`src/components/layout/Footer.tsx`:

- カラム数とカラム内容の変更
- SNS リンクの追加
- コピーライト表記の変更

## MDX 記事スタイル

`@tailwindcss/typography` の `.prose` クラスをカスタマイズ:

```css
.prose {
  --tw-prose-body: hsl(var(--foreground));
  --tw-prose-headings: hsl(var(--foreground));
  --tw-prose-links: hsl(var(--primary));
}

.prose h2 {
  @apply border-b pb-2;
}

.prose img {
  @apply rounded-lg;
}
```

## レスポンシブ設計

Tailwind のブレークポイント:

| プレフィックス | 最小幅 | 用途 |
|-------------|-------|------|
| (なし) | 0px | モバイル |
| `sm:` | 640px | 小型タブレット |
| `md:` | 768px | タブレット |
| `lg:` | 1024px | デスクトップ |
| `xl:` | 1280px | 大画面 |
