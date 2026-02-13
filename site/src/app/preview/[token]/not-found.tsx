import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PreviewNotFound() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-bold mb-4">
          プレビューが見つかりません
        </h1>

        <p className="text-muted-foreground mb-8">
          プレビューリンクが無効または期限切れです。
          管理画面から新しいプレビューリンクを発行してください。
        </p>

        <Button asChild>
          <Link href="/">
            トップページに戻る
          </Link>
        </Button>
      </div>
    </div>
  )
}
