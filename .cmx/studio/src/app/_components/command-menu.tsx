"use client"

import { useState, useEffect } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Terminal, ChevronRight, Loader2 } from "lucide-react"

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

interface CommandMenuProps {
  onCommandSelect: (command: CommandMetadata) => void
}

/**
 * 階層的なコマンドメニュー
 */
export function CommandMenu({ onCommandSelect }: CommandMenuProps) {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<CommandGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    if (open && groups.length === 0) {
      loadCommands()
    }
  }, [open])

  const loadCommands = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/setup/commands")
      const data = await response.json()
      setGroups(data.groups || [])
      // デフォルトで最初のカテゴリを展開
      if (data.groups && data.groups.length > 0) {
        setExpandedCategories(new Set([data.groups[0].category]))
      }
    } catch (error) {
      console.error("Failed to load commands:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleCommandClick = (command: CommandMetadata) => {
    onCommandSelect(command)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-300"
        >
          <Terminal className="h-3.5 w-3.5" />
          Commands
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 bg-white"
        sideOffset={8}
      >
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-sm text-slate-900">
            Custom Commands
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            プロジェクトのカスタムコマンド
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : groups.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Terminal className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">
              カスタムコマンドがありません
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <div className="py-2">
              {groups.map((group) => (
                <div key={group.category} className="mb-1">
                  {/* カテゴリヘッダー */}
                  <button
                    onClick={() => toggleCategory(group.category)}
                    className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {group.category}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        expandedCategories.has(group.category)
                          ? "rotate-90"
                          : ""
                      }`}
                    />
                  </button>

                  {/* コマンド一覧 */}
                  {expandedCategories.has(group.category) && (
                    <div className="pb-2">
                      {group.commands.map((command) => (
                        <button
                          key={command.id}
                          onClick={() => handleCommandClick(command)}
                          className="w-full flex items-start gap-3 px-6 py-2.5 text-left hover:bg-slate-900 hover:text-white transition-colors group"
                        >
                          <Terminal className="h-4 w-4 mt-0.5 text-slate-400 group-hover:text-white/70 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 group-hover:text-white truncate">
                              {command.name}
                            </div>
                            <div className="text-xs text-slate-500 group-hover:text-white/70 mt-0.5 line-clamp-2">
                              {command.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
