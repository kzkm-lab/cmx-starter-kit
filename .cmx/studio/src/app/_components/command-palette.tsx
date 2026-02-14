"use client"

import { useEffect, useRef } from "react"
import {
  Settings,
  Globe,
  BookOpen,
  HelpCircle,
  Wrench,
} from "lucide-react"

export type Command = {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  action: () => void
}

interface CommandPaletteProps {
  commands: Command[]
  selectedIndex: number
  onSelect: (index: number) => void
  onExecute: (command: Command) => void
  position?: { top: number; left: number }
}

/**
 * コマンドパレットコンポーネント
 * スラッシュコマンドの候補を表示
 */
export function CommandPalette({
  commands,
  selectedIndex,
  onSelect,
  onExecute,
  position,
}: CommandPaletteProps) {
  const paletteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 選択されたアイテムがビューポート内に表示されるようスクロール
    const selectedElement = paletteRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    )
    selectedElement?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  if (commands.length === 0) return null

  return (
    <div
      ref={paletteRef}
      className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50"
      style={position}
    >
      <div className="py-2 max-h-64 overflow-y-auto">
        <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Commands
        </div>
        {commands.map((command, index) => (
          <button
            key={command.id}
            data-index={index}
            onClick={() => onExecute(command)}
            onMouseEnter={() => onSelect(index)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
              index === selectedIndex
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                index === selectedIndex
                  ? "bg-white/10"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {command.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm font-medium">
                {command.label}
              </div>
              <div
                className={`text-xs ${
                  index === selectedIndex ? "text-white/70" : "text-slate-500"
                }`}
              >
                {command.description}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>↑↓ Navigate</span>
        <span>↵ Select</span>
        <span>Esc Close</span>
      </div>
    </div>
  )
}

/**
 * デフォルトコマンド定義
 */
export const createDefaultCommands = (callbacks: {
  onOpenEnvSettings: () => void
  onOpenSiteSettings: () => void
  onShowHelp: () => void
}): Command[] => [
  {
    id: "env",
    label: "/env",
    description: "環境変数設定を開く",
    icon: <Settings className="h-4 w-4" />,
    action: callbacks.onOpenEnvSettings,
  },
  {
    id: "site",
    label: "/site",
    description: "サイト設定を開く",
    icon: <Globe className="h-4 w-4" />,
    action: callbacks.onOpenSiteSettings,
  },
  {
    id: "setup",
    label: "/setup",
    description: "セットアップガイドを表示",
    icon: <Wrench className="h-4 w-4" />,
    action: () => {
      window.alert(
        "セットアップガイド:\n\n1. 環境変数を設定 (/env)\n2. サイト基本情報を設定 (/site)\n3. localhost:4000 でサイトを確認\n4. コンテンツを追加"
      )
    },
  },
  {
    id: "docs",
    label: "/docs",
    description: "ドキュメントを開く",
    icon: <BookOpen className="h-4 w-4" />,
    action: () => {
      window.open("https://github.com/kzkm-lab/cmx", "_blank")
    },
  },
  {
    id: "help",
    label: "/help",
    description: "ヘルプを表示",
    icon: <HelpCircle className="h-4 w-4" />,
    action: callbacks.onShowHelp,
  },
]
