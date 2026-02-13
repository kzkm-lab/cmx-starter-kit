import { spawnClaudeCode, type NormalizedMessage } from "./claude-code-cli"
import { getSiteDirPath } from "./setup-state"
import type { ChildProcess } from "child_process"

export interface AgentOptions {
  prompt: string
  sessionId?: string | null
}

/** フロントエンドに送信するメッセージ（NormalizedMessage と同一） */
export type AgentMessage = NormalizedMessage

/**
 * Claude Code CLI を使って site/ ディレクトリでエージェントを実行
 *
 * 制御プロトコル（initialize → set_permission_mode → user message）を経由して
 * Claude Code CLI と通信し、結果を AsyncGenerator で返す。
 * session_id は Claude Code が生成した実際のIDを返す。
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
      onMessage: (message: NormalizedMessage) => {
        // Claude Code からのメッセージをキューに追加
        messageQueue.push(message)

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

    // メッセージキューを順次処理
    // session_id は Claude Code の出力から抽出される（onMessage 経由）
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
