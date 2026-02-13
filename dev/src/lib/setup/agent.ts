import { spawnClaudeCode, type ClaudeCodeMessage } from "./claude-code-cli"
import { getSiteDirPath } from "./setup-state"
import type { ChildProcess } from "child_process"

export interface AgentOptions {
  prompt: string
  sessionId?: string
}

export interface AgentMessage {
  type: "text" | "tool_use" | "tool_result" | "error" | "done" | "session"
  content?: string
  sessionId?: string
  toolName?: string
  toolInput?: unknown
  toolResult?: unknown
  error?: string
}

/**
 * Claude Code CLI を使って site/ ディレクトリでエージェントを実行
 *
 * Agent SDK の代わりに npx @anthropic-ai/claude-code を直接呼び出す
 * OAuth で取得したトークンは ~/.claude.json に保存されており、
 * Claude Code CLI が自動的に読み込む
 */
export async function* runAgent(
  options: AgentOptions
): AsyncGenerator<AgentMessage> {
  const siteDir = getSiteDirPath()

  // メッセージキューを作成
  const messageQueue: AgentMessage[] = []
  let isCompleted = false
  let processError: Error | null = null
  let childProcess: ChildProcess | null = null

  // Claude Code CLI を起動
  try {
    childProcess = spawnClaudeCode({
      prompt: options.prompt,
      cwd: siteDir,
      sessionId: options.sessionId,
      onMessage: (message: ClaudeCodeMessage) => {
        // Claude Code からのメッセージをキューに追加
        messageQueue.push({
          type: message.type,
          content: message.content,
          toolName: message.toolName,
          toolInput: message.toolInput,
          toolResult: message.toolResult,
          error: message.error,
        })

        // 完了メッセージを受け取ったらフラグを立てる
        if (message.type === "done") {
          isCompleted = true
        }
      },
      onError: (error: Error) => {
        processError = error
        isCompleted = true
      },
      onExit: (code: number | null) => {
        if (code !== 0 && code !== null) {
          processError = new Error(`Claude Code CLI exited with code ${code}`)
        }
        isCompleted = true
      },
    })

    // セッションIDを返す（初回実行時）
    if (!options.sessionId && childProcess.pid) {
      yield {
        type: "session",
        sessionId: `session-${childProcess.pid}-${Date.now()}`,
      }
    }

    // メッセージキューを順次処理
    while (!isCompleted || messageQueue.length > 0) {
      if (messageQueue.length > 0) {
        const message = messageQueue.shift()!
        yield message
      } else {
        // キューが空の場合は少し待つ
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    // エラーがあれば投げる
    if (processError) {
      throw processError
    }
  } catch (error) {
    console.error("Claude Code CLI error:", error)
    yield {
      type: "error",
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    }
  } finally {
    // プロセスをクリーンアップ
    if (childProcess && !childProcess.killed) {
      childProcess.kill()
    }
  }
}
