import { query } from "@anthropic-ai/claude-agent-sdk"
import { getSiteDirPath } from "./setup-state"

export interface AgentOptions {
  prompt: string
  sessionId?: string
  apiKey?: string
}

export interface AgentMessage {
  type: "text" | "tool_use" | "tool_result"
  content: string
  toolName?: string
  toolInput?: unknown
  toolResult?: unknown
}

/**
 * Agent SDK を使って site/ ディレクトリでエージェントを実行
 */
export async function* runAgent(options: AgentOptions): AsyncGenerator<AgentMessage> {
  const siteDir = getSiteDirPath()
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error("Anthropic API Key が設定されていません")
  }

  try {
    // Agent SDK の query() を使ってエージェントを起動
    const messages = query({
      prompt: options.prompt,
      options: {
        allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
        settingSources: ["project"], // site/ 内の CLAUDE.md、スキルを読み込む
        systemPrompt: { type: "preset", preset: "claude_code" },
        includePartialMessages: true, // ストリーミング用
        cwd: siteDir, // site/ だけが操作対象
        resume: options.sessionId, // マルチターン対話
        apiKey,
        // パーミッション制御: site/ 内のみ許可
        canUseTool: async (tool) => {
          // Read/Glob/Grep は自動承認
          if (["Read", "Glob", "Grep"].includes(tool.name)) {
            return true
          }

          // Write/Edit/Bash は site/ ディレクトリ内のみ許可
          if (tool.name === "Write" || tool.name === "Edit") {
            const filePath = tool.params?.file_path as string
            if (filePath && !filePath.startsWith(siteDir)) {
              return false // dev/ への操作は拒否
            }
          }

          if (tool.name === "Bash") {
            const command = tool.params?.command as string
            // dev/ への操作を含むコマンドは拒否
            if (command && command.includes("../dev")) {
              return false
            }
          }

          return true
        },
      },
    })

    // Agent SDK のメッセージをストリーミング
    for await (const message of messages) {
      yield normalizeAgentMessage(message)
    }
  } catch (error) {
    console.error("Agent SDK error:", error)
    throw error
  }
}

/**
 * Agent SDK のメッセージを正規化
 */
function normalizeAgentMessage(message: any): AgentMessage {
  // Agent SDK の実際のメッセージ型に合わせて実装
  // プレースホルダー実装
  return {
    type: "text",
    content: JSON.stringify(message),
  }
}
