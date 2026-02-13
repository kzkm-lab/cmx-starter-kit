import { spawn, type ChildProcess } from "child_process"

/**
 * Claude Code CLI メッセージ型
 */
export interface ClaudeCodeMessage {
  type: "text" | "tool_use" | "tool_result" | "error" | "done"
  content?: string
  toolName?: string
  toolInput?: unknown
  toolResult?: unknown
  error?: string
}

/**
 * Claude Code CLI オプション
 */
export interface ClaudeCodeOptions {
  prompt: string
  cwd: string
  sessionId?: string
  onMessage: (message: ClaudeCodeMessage) => void
  onError: (error: Error) => void
  onExit: (code: number | null) => void
}

/**
 * Claude Code CLI をラップして起動
 *
 * npx @anthropic-ai/claude-code を spawn で起動し、
 * stdin/stdout で JSON ストリーム通信を行う
 */
export function spawnClaudeCode(options: ClaudeCodeOptions): ChildProcess {
  const { prompt, cwd, sessionId, onMessage, onError, onExit } = options

  // Claude Code CLI コマンド
  const args = [
    "-y",
    "@anthropic-ai/claude-code@latest",
    "-p",
    "--verbose",
    "--output-format=stream-json",
    "--input-format=stream-json",
    "--include-partial-messages",
    "--replay-user-messages",
  ]

  // セッション再開の場合
  if (sessionId) {
    args.push("--resume", sessionId)
  }

  // Claude Code CLI を起動
  const child = spawn("npx", args, {
    cwd,
    env: {
      ...process.env,
      NPM_CONFIG_LOGLEVEL: "error",
      // ANTHROPIC_API_KEY を削除して、Claude Code サブスクリプションのみで動作
      ANTHROPIC_API_KEY: undefined,
    },
    stdio: ["pipe", "pipe", "pipe"],
  })

  // stdin にプロンプトを送信
  if (child.stdin) {
    const initialMessage = JSON.stringify({
      type: "user_message",
      content: prompt,
    })
    child.stdin.write(initialMessage + "\n")
  }

  // stdout からのメッセージを処理
  let buffer = ""
  if (child.stdout) {
    child.stdout.on("data", (data: Buffer) => {
      buffer += data.toString()
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line) as ClaudeCodeMessage
            onMessage(message)
          } catch (error) {
            console.error("Failed to parse Claude Code output:", line, error)
          }
        }
      }
    })
  }

  // stderr からのエラーメッセージを処理
  if (child.stderr) {
    child.stderr.on("data", (data: Buffer) => {
      const errorMessage = data.toString()
      console.error("Claude Code stderr:", errorMessage)
    })
  }

  // エラーハンドリング
  child.on("error", (error) => {
    onError(error)
  })

  // 終了ハンドリング
  child.on("exit", (code) => {
    onExit(code)
  })

  return child
}
