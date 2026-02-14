"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Circle, Loader2, CheckCircle2 } from "lucide-react"
import type { TodoItem } from "@/lib/setup/claude-code-cli"

interface TodoPanelProps {
  todos: TodoItem[]
}

const statusConfig = {
  pending: {
    icon: Circle,
    className: "text-slate-400",
  },
  in_progress: {
    icon: Loader2,
    className: "text-blue-500 animate-spin",
  },
  completed: {
    icon: CheckCircle2,
    className: "text-green-500",
  },
} as const

export function TodoPanel({ todos }: TodoPanelProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (todos.length === 0) return null

  const completed = todos.filter((t) => t.status === "completed").length
  const total = todos.length

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span>Tasks</span>
        <span className="text-slate-400 ml-auto">
          {completed}/{total}
        </span>
        {/* Progress bar */}
        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </div>
      </button>

      {/* Todo list */}
      {isOpen && (
        <div className="border-t border-slate-100 px-3 py-1.5">
          {todos.map((todo, index) => {
            const config = statusConfig[todo.status]
            const Icon = config.icon
            const label =
              todo.status === "in_progress" ? todo.activeForm : todo.content

            return (
              <div
                key={index}
                className="flex items-center gap-2 py-1 text-xs"
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${config.className}`} />
                <span
                  className={
                    todo.status === "completed"
                      ? "text-slate-400 line-through"
                      : todo.status === "in_progress"
                        ? "text-blue-700 font-medium"
                        : "text-slate-600"
                  }
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
