import { NextRequest, NextResponse } from "next/server"
import { loadTasks, saveTasks, clearTasks, type Task } from "@/lib/setup/session-file"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/setup/sessions
 * セッション情報を取得
 */
export async function GET() {
  try {
    const tasks = await loadTasks()
    return NextResponse.json({ tasks })
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
    const { tasks } = await request.json() as { tasks: Task[] }

    if (!Array.isArray(tasks)) {
      return NextResponse.json({ error: "Invalid tasks data" }, { status: 400 })
    }

    await saveTasks(tasks)
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
    await clearTasks()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to clear sessions:", error)
    return NextResponse.json({ error: "Failed to clear sessions" }, { status: 500 })
  }
}
