"use client"

import { useActionState } from "react"
import { submitContactForm } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, null)

  if (state?.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-lg font-semibold mb-2">送信ありがとうございます</p>
            <p className="text-muted-foreground">
              担当者よりご連絡いたします。
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>お問い合わせフォーム</CardTitle>
        <CardDescription>
          以下のフォームに必要事項をご記入ください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Honeypot */}
          <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">お名前 *</Label>
              <Input id="name" name="name" placeholder="山田 太郎" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス *</Label>
              <Input id="email" name="email" type="email" placeholder="example@example.com" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">会社名</Label>
            <Input id="company" name="company" placeholder="株式会社〇〇" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">件名 *</Label>
            <Input id="subject" name="subject" placeholder="お問い合わせの件名" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">お問い合わせ内容 *</Label>
            <Textarea id="message" name="message" placeholder="お問い合わせ内容をご記入ください" rows={6} required />
          </div>

          {state?.error && (
            <div className="text-sm text-destructive">{state.error}</div>
          )}

          <Button type="submit" disabled={isPending} className="w-full md:w-auto">
            {isPending ? "送信中..." : "送信する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
