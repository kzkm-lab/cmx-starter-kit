import { spawn, type ChildProcess } from "child_process"

// ============================================================
// Claude Code stream-json 出力の型定義
// ============================================================

/** content 配列の要素 */
export interface ClaudeContentText {
  type: "text"
  text: string
}

export interface ClaudeContentThinking {
  type: "thinking"
  thinking: string
}

export interface ClaudeContentToolUse {
  type: "tool_use"
  id: string
  name: string
  input: unknown
}

export interface ClaudeContentToolResult {
  type: "tool_result"
  tool_use_id: string
  content: unknown
  is_error?: boolean
}

export type ClaudeContentItem =
  | ClaudeContentText
  | ClaudeContentThinking
  | ClaudeContentToolUse
  | ClaudeContentToolResult

/** Claude Code のメッセージ構造 */
export interface ClaudeMessage {
  id?: string
  type?: string
  role: string
  model?: string
  content: ClaudeContentItem[]
  stop_reason?: string
}

/** stream-json 出力のメッセージ型（type フィールドで判別） */
export type CLIOutputMessage =
  | { type: "system"; subtype?: string; session_id?: string }
  | {
      type: "assistant"
      message: ClaudeMessage
      session_id?: string
      uuid?: string
    }
  | {
      type: "user"
      message: ClaudeMessage
      session_id?: string
      uuid?: string
      isSynthetic?: boolean
      isReplay?: boolean
    }
  | {
      type: "tool_use"
      tool_name: string
      session_id?: string
      [key: string]: unknown
    }
  | {
      type: "tool_result"
      tool_name?: string
      session_id?: string
      content?: unknown
      is_error?: boolean
    }
  | {
      type: "result"
      subtype?: string
      result?: unknown
      session_id?: string
      is_error?: boolean
      isError?: boolean
      error?: string
      durationMs?: number
      numTurns?: number
    }
  | { type: "stream_event"; event?: unknown; session_id?: string }

// ============================================================
// フロントエンド向けの正規化されたメッセージ型
// ============================================================

export interface TodoItem {
  content: string
  status: "pending" | "in_progress" | "completed"
  activeForm: string
}

export interface NormalizedMessage {
  type: "text" | "tool_use" | "tool_result" | "error" | "done" | "session" | "todo_update"
  content?: string
  sessionId?: string
  toolName?: string
  toolInput?: unknown
  toolResult?: unknown
  error?: string
  todos?: TodoItem[]
}

// ============================================================
// Claude Code CLI オプション
// ============================================================

export interface ClaudeCodeOptions {
  prompt: string
  cwd: string
  sessionId?: string | null
  onMessage: (message: NormalizedMessage) => void
  onError: (error: Error) => void
  onExit: (code: number | null) => void
}

// ============================================================
// ヘルパー関数
// ============================================================

/** assistant メッセージの content 配列からテキストを抽出 */
export function extractTextFromContent(content: ClaudeContentItem[]): string {
  return content
    .filter((item): item is ClaudeContentText => item.type === "text")
    .map((item) => item.text)
    .join("")
}

/** メッセージから session_id を抽出 */
function extractSessionId(msg: CLIOutputMessage): string | undefined {
  if ("session_id" in msg) {
    return msg.session_id ?? undefined
  }
  return undefined
}

// ============================================================
// メインの spawn 関数
// ============================================================

/**
 * Claude Code CLI をラップして起動
 *
 * プロンプトを CLI 引数として渡し、--output-format=stream-json で
 * 構造化された出力を受け取る。
 *
 * --dangerously-skip-permissions で全ツールを自動承認（サンドボックス環境向け）
 * --disallowedTools=AskUserQuestion でヘッドレス環境でのハングを防止
 *
 * セッション再開は --resume SESSION_ID で行う。
 * session_id は stdout の stream-json メッセージから抽出する。
 */
export function spawnClaudeCode(options: ClaudeCodeOptions): ChildProcess {
  const { prompt, cwd, sessionId, onMessage, onError, onExit } = options

  // Claude Code CLI コマンド引数
  const args = [
    "-y",
    "@anthropic-ai/claude-code@latest",
    "--print",
    "--verbose",
    "--output-format",
    "stream-json",
    "--dangerously-skip-permissions",
    "--disallowedTools",
    "AskUserQuestion",
  ]

  // セッション再開の場合
  if (sessionId) {
    args.push("--resume", sessionId)
  }

  // 環境変数を構築
  const env = {
    ...process.env,
    NPM_CONFIG_LOGLEVEL: "error",
    // CLAUDECODE を削除（Claude Code 内からの起動を許可、ネストセッション検知バイパス）
    CLAUDECODE: "",
    // ANTHROPIC_API_KEY を削除して、Claude Code サブスクリプションのみで動作
    ANTHROPIC_API_KEY: "",
  }

  // Claude Code CLI を起動
  const child = spawn("npx", args, {
    cwd,
    env,
    stdio: ["pipe", "pipe", "pipe"] as const,
  })

  // stdin 経由でプロンプトを送信して閉じる
  if (child.stdin) {
    child.stdin.write(prompt)
    child.stdin.end()
  }

  // session_id 追跡
  let extractedSessionId: string | null = null

  // ── stdout パース ──
  let buffer = ""
  if (child.stdout) {
    child.stdout.on("data", (data: Buffer) => {
      buffer += data.toString()
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (!line.trim()) continue

        let msg: CLIOutputMessage
        try {
          msg = JSON.parse(line) as CLIOutputMessage
        } catch {
          // JSON パース失敗は無視（npx のログなど）
          continue
        }

        // session_id を抽出（最初に見つかったもの）
        if (!extractedSessionId) {
          const sid = extractSessionId(msg)
          if (sid) {
            extractedSessionId = sid
            onMessage({ type: "session", sessionId: sid })
          }
        }

        // メッセージタイプごとの処理
        switch (msg.type) {
          case "assistant": {
            const text = extractTextFromContent(msg.message.content)
            if (text) {
              onMessage({ type: "text", content: text })
            }
            break
          }

          case "tool_use": {
            // TodoWrite ツールの場合は todo_update として発行
            if (msg.tool_name === "TodoWrite") {
              const raw = msg as Record<string, unknown>
              const todos = raw.todos as TodoItem[] | undefined
              if (todos && Array.isArray(todos)) {
                onMessage({ type: "todo_update", todos })
                break
              }
            }
            onMessage({
              type: "tool_use",
              toolName: msg.tool_name,
              toolInput: msg,
            })
            break
          }

          case "tool_result": {
            onMessage({
              type: "tool_result",
              toolName: msg.tool_name,
              toolResult: msg.content,
            })
            break
          }

          case "result": {
            // result メッセージで完了
            if (msg.is_error || msg.isError) {
              onMessage({
                type: "error",
                error: msg.error || "Claude Code returned an error",
              })
            }
            onMessage({ type: "done" })
            break
          }

          // system, user, stream_event は表示に影響しないのでスキップ
          default:
            break
        }
      }
    })
  }

  // ── stderr ──
  if (child.stderr) {
    child.stderr.on("data", (data: Buffer) => {
      const errorMessage = data.toString()
      console.error("Claude Code stderr:", errorMessage)
    })
  }

  // ── エラー & 終了 ──
  child.on("error", (error) => {
    onError(error)
  })

  child.on("exit", (code) => {
    onExit(code)
  })

  return child
}
