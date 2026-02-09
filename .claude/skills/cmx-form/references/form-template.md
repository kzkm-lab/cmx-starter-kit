# フォームテンプレート

## 基本構造

```tsx
// src/app/{path}/contact-form.tsx
"use client"

import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  message: z.string().min(1, "メッセージを入力してください"),
})

type FormData = z.infer<typeof formSchema>

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", message: "" })
  const [honeypot, setHoneypot] = useState("")
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setErrorMessage("")

    // バリデーション
    const result = formSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormData
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setStatus("submitting")

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CMX_API_URL}/api/v1/public/submissions/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...result.data, _hp: honeypot }),
        }
      )

      if (!response.ok) {
        throw new Error("送信に失敗しました")
      }

      setStatus("success")
      setFormData({ name: "", email: "", message: "" })
    } catch {
      setStatus("error")
      setErrorMessage("送信に失敗しました。しばらく経ってから再度お試しください。")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">送信完了</h3>
        <p className="text-muted-foreground">お問い合わせありがとうございます。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ハニーポット（非表示） */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="_hp"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">お名前 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <p id="name-error" className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">メッセージ *</Label>
        <Textarea
          id="message"
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && <p id="message-error" className="text-sm text-destructive">{errors.message}</p>}
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "送信中..." : "送信する"}
      </Button>
    </form>
  )
}
```

## カスタマイズポイント

- `formSchema`: フィールドに合わせて Zod スキーマを変更
- `formSlug`: Admin で定義したフォームのスラッグに合わせる
- スタイリング: site-config.md のデザイン方針に沿って調整
- 送信後の挙動: サンクスメッセージ or リダイレクト
