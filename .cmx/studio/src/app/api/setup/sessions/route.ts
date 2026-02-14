import { NextRequest, NextResponse } from "next/server"
import { loadTabs, saveTabs, clearTabs, type ChatTab } from "@/lib/setup/session-file"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/setup/sessions
 * セッション情報を取得
 */
export async function GET() {
  try {
    const tabs = await loadTabs()
    return NextResponse.json({ tabs })
  } catch (error) {
    console.error("Failed to load sessions:", error)
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 })
  }
}

/**
 * POST /api/setup/sessions
 * セッション情報を保存
 */
export async function POST(request: NextRequest) {
  try {
    const { tabs } = await request.json() as { tabs: ChatTab[] }

    if (!Array.isArray(tabs)) {
      return NextResponse.json({ error: "Invalid tabs data" }, { status: 400 })
    }

    await saveTabs(tabs)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save sessions:", error)
    return NextResponse.json({ error: "Failed to save sessions" }, { status: 500 })
  }
}

/**
 * DELETE /api/setup/sessions
 * セッション情報をクリア
 */
export async function DELETE() {
  try {
    await clearTabs()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to clear sessions:", error)
    return NextResponse.json({ error: "Failed to clear sessions" }, { status: 500 })
  }
}
