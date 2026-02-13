import { ChatInterface } from "./_components/chat-interface"

export default function SetupPage() {
  return (
    <main className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">CMX Starter Kit Setup</h1>
        <p className="text-sm text-gray-600 mt-1">
          AIと対話しながらサイトをセットアップ
        </p>
      </header>

      {/* チャットインターフェース */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </main>
  )
}
