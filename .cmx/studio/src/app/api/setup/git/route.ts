import { NextRequest } from "next/server"
import {
  getGitStatus,
  getGitDiffSummary,
  createBranch,
  switchTask,
  applyTaskDirect,
  pushTaskBranch,
  switchToDevelop,
  syncFromDevelop,
} from "@/lib/setup/git-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/setup/git
 * サイトの git ステータスを返す（ブランチ、変更ファイル、環境情報）
 */
export async function GET() {
  try {
    const status = getGitStatus()
    return Response.json(status)
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Git情報の取得に失敗" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/setup/git
 * アクション実行
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "diff": {
        const diff = getGitDiffSummary()
        return Response.json({ diff })
      }

      case "create-branch": {
        const { branchName } = body
        if (!branchName || typeof branchName !== "string") {
          return Response.json({ error: "branchName is required" }, { status: 400 })
        }
        const result = createBranch(branchName)
        if (!result.success) {
          return Response.json({ error: result.error }, { status: 500 })
        }
        return Response.json({ success: true })
      }

      case "switch-task": {
        const { fromTaskId, toTaskId, toBranch } = body
        if (!fromTaskId || !toTaskId) {
          return Response.json({ error: "fromTaskId and toTaskId are required" }, { status: 400 })
        }
        const result = switchTask({ fromTaskId, toTaskId, toBranch: toBranch ?? null })
        if (!result.success) {
          return Response.json({ error: result.error }, { status: 500 })
        }
        return Response.json({ success: true, checkpointHash: result.checkpointHash })
      }

      case "apply-task": {
        const { taskId, branchName, summary } = body
        if (!taskId || !branchName) {
          return Response.json({ error: "taskId and branchName are required" }, { status: 400 })
        }
        const result = applyTaskDirect({ taskId, branchName, summary: summary ?? "" })
        if (!result.success) {
          return Response.json({ error: result.error }, { status: 500 })
        }
        return Response.json({ success: true })
      }

      case "push-task": {
        const { taskId, branchName } = body
        if (!taskId || !branchName) {
          return Response.json({ error: "taskId and branchName are required" }, { status: 400 })
        }
        const result = pushTaskBranch({ taskId, branchName })
        if (!result.success) {
          return Response.json({ error: result.error }, { status: 500 })
        }
        return Response.json({ success: true })
      }

      case "switch-to-develop": {
        const { taskId } = body
        const result = switchToDevelop(taskId)
        if (!result.success) {
          return Response.json({ error: result.error }, { status: 500 })
        }
        return Response.json({ success: true })
      }

      case "sync-from-develop": {
        const { taskId } = body
        if (!taskId) {
          return Response.json({ error: "taskId is required" }, { status: 400 })
        }
        const result = syncFromDevelop(taskId)
        if (!result.success) {
          return Response.json({ error: result.error }, { status: 500 })
        }
        return Response.json({ success: true })
      }

      default:
        return Response.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "アクション実行に失敗" },
      { status: 500 }
    )
  }
}
