import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import matter from "gray-matter"

const COMMANDS_DIR = path.join(process.cwd(), "../site/.claude/commands")

export type CommandMetadata = {
  id: string
  name: string
  description: string
  category: string
  tags?: string[]
  path: string
}

export type CommandGroup = {
  category: string
  commands: CommandMetadata[]
}

/**
 * コマンドファイルを再帰的に読み込む
 */
async function readCommandsRecursive(
  dir: string,
  basePath: string = ""
): Promise<CommandMetadata[]> {
  const commands: CommandMetadata[] = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.join(basePath, entry.name)

      if (entry.isDirectory()) {
        // サブディレクトリを再帰的に読み込む
        const subCommands = await readCommandsRecursive(fullPath, relativePath)
        commands.push(...subCommands)
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        try {
          const content = await fs.readFile(fullPath, "utf-8")
          const { data } = matter(content)

          // コマンドIDを生成
          const commandId = relativePath
            .replace(/\.md$/, "")
            .replace(/\\/g, "/")

          // name がない場合はファイル名から生成
          const fileName = entry.name.replace(/\.md$/, "")
          const displayName = (data.name as string) || fileName
            .replace(/^\d+_/, "") // 先頭の数字とアンダースコアを削除
            .replace(/[-_]/g, " ") // ハイフンとアンダースコアをスペースに
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

          commands.push({
            id: commandId,
            name: displayName,
            description: (data.description as string) || "",
            category: (data.category as string) || "その他",
            tags: (data.tags as string[]) || [],
            path: relativePath,
          })
        } catch (error) {
          console.error(`Failed to read command file: ${fullPath}`, error)
        }
      }
    }
  } catch (error) {
    console.error(`Failed to read commands directory: ${dir}`, error)
  }

  return commands
}

/**
 * コマンドをカテゴリごとにグループ化
 */
function groupCommandsByCategory(
  commands: CommandMetadata[]
): CommandGroup[] {
  const groups = new Map<string, CommandMetadata[]>()

  for (const command of commands) {
    const category = command.category || "その他"
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category)!.push(command)
  }

  return Array.from(groups.entries())
    .map(([category, commands]) => ({
      category,
      commands: commands.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.category.localeCompare(b.category))
}

/**
 * GET /api/setup/commands
 * カスタムコマンド一覧を取得
 */
export async function GET() {
  try {
    const commands = await readCommandsRecursive(COMMANDS_DIR)
    const groups = groupCommandsByCategory(commands)

    return NextResponse.json({
      groups,
      total: commands.length,
    })
  } catch (error) {
    console.error("Failed to get commands:", error)
    return NextResponse.json(
      { error: "コマンドの取得に失敗しました", groups: [] },
      { status: 500 }
    )
  }
}

/**
 * POST /api/setup/commands/:id/execute
 * コマンドを実行（コマンドの内容を返す）
 */
export async function POST(request: Request) {
  try {
    const { commandId } = await request.json()

    if (!commandId) {
      return NextResponse.json(
        { error: "コマンドIDが指定されていません" },
        { status: 400 }
      )
    }

    const commandPath = path.join(COMMANDS_DIR, `${commandId}.md`)
    const content = await fs.readFile(commandPath, "utf-8")
    const { data, content: body } = matter(content)

    return NextResponse.json({
      metadata: data,
      content: body,
    })
  } catch (error) {
    console.error("Failed to execute command:", error)
    return NextResponse.json(
      { error: "コマンドの実行に失敗しました" },
      { status: 500 }
    )
  }
}
