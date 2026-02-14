"use client"

import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Type,
  Code,
  Component,
  Bold,
  Italic,
  Strikethrough,
  Link,
  Image,
  CheckSquare,
} from "lucide-react"
import { componentCatalog, ComponentName } from "@/lib/mdx"

// ============================================
// Types
// ============================================

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "list"
  | "ordered-list"
  | "quote"
  | "code"
  | "component"

export type FormatType =
  | "bold"
  | "italic"
  | "strike"
  | "link"
  | "image"
  | "checklist"
  | "h1"
  | "h2"
  | "h3"
  | "list"
  | "ordered-list"
  | "quote"
  | "code"

export interface EditorCommand {
  id: string
  type: BlockType
  title: string
  description: string
  icon: React.ReactNode
  mdx: string | ((prefix: string) => string)
  category: "basic" | "component"
  componentName?: ComponentName
}

// Format command for toolbar (wrapping text or inserting)
export interface FormatCommand {
  id: FormatType
  title: string
  icon: React.ReactNode
  // For wrap commands: { wrap: "**", wrapEnd: "**" }
  // For insert commands: { insert: "# " }
  wrap?: string
  wrapEnd?: string
  insert?: string
  // Cursor position after insert (for insert commands)
  cursorOffset?: number
}

// ============================================
// Command Definitions
// ============================================

// $0 marks cursor position after insertion
export const CURSOR_MARKER = "$0"

export const basicCommands: EditorCommand[] = [
  {
    id: "paragraph",
    type: "paragraph",
    title: "テキスト",
    description: "通常のテキスト",
    icon: <Type className="h-4 w-4" />,
    mdx: "$0",
    category: "basic",
  },
  {
    id: "heading1",
    type: "heading1",
    title: "見出し1",
    description: "セクションの大見出し",
    icon: <Heading1 className="h-4 w-4" />,
    mdx: "# $0",
    category: "basic",
  },
  {
    id: "heading2",
    type: "heading2",
    title: "見出し2",
    description: "セクションの中見出し",
    icon: <Heading2 className="h-4 w-4" />,
    mdx: "## $0",
    category: "basic",
  },
  {
    id: "heading3",
    type: "heading3",
    title: "見出し3",
    description: "セクションの小見出し",
    icon: <Heading3 className="h-4 w-4" />,
    mdx: "### $0",
    category: "basic",
  },
  {
    id: "list",
    type: "list",
    title: "箇条書きリスト",
    description: "シンプルな箇条書き",
    icon: <List className="h-4 w-4" />,
    mdx: "- $0",
    category: "basic",
  },
  {
    id: "ordered-list",
    type: "ordered-list",
    title: "番号付きリスト",
    description: "順序のあるリスト",
    icon: <ListOrdered className="h-4 w-4" />,
    mdx: "1. $0",
    category: "basic",
  },
  {
    id: "quote",
    type: "quote",
    title: "引用",
    description: "引用文の挿入",
    icon: <Quote className="h-4 w-4" />,
    mdx: "> $0",
    category: "basic",
  },
  {
    id: "code",
    type: "code",
    title: "コード",
    description: "コードブロック",
    icon: <Code className="h-4 w-4" />,
    mdx: "```\n$0\n```",
    category: "basic",
  },
]

// Process MDX template: returns { text, cursorOffset }
export function processTemplate(template: string): { text: string; cursorOffset: number } {
  const cursorIndex = template.indexOf(CURSOR_MARKER)
  if (cursorIndex === -1) {
    return { text: template, cursorOffset: template.length }
  }
  const text = template.replace(CURSOR_MARKER, "")
  return { text, cursorOffset: cursorIndex }
}

// Generate component commands from catalog
export function getComponentCommands(): EditorCommand[] {
  return Object.values(componentCatalog).map((def) => ({
    id: def.name,
    type: "component" as BlockType,
    title: def.displayName,
    description: def.description,
    icon: <Component className="h-4 w-4 text-primary" />,
    mdx: (def.examples && def.examples[0]) ? def.examples[0] : `<${def.name} />`,
    category: "component" as const,
    componentName: def.name as ComponentName,
  }))
}

// Get all commands
export function getAllCommands(): EditorCommand[] {
  return [...basicCommands, ...getComponentCommands()]
}

// Get command by type
export function getCommandByType(type: BlockType): EditorCommand | undefined {
  return basicCommands.find((cmd) => cmd.type === type)
}

// Get command config (icon, label, color) for block type
export function getBlockConfig(type: BlockType): { icon: typeof Type; label: string; color: string } {
  const configs: Record<BlockType, { icon: typeof Type; label: string; color: string }> = {
    paragraph: { icon: Type, label: "段落", color: "text-muted-foreground" },
    heading1: { icon: Heading1, label: "見出し1", color: "text-primary" },
    heading2: { icon: Heading2, label: "見出し2", color: "text-primary" },
    heading3: { icon: Heading3, label: "見出し3", color: "text-primary" },
    list: { icon: List, label: "箇条書き", color: "text-primary" },
    "ordered-list": { icon: ListOrdered, label: "番号リスト", color: "text-primary" },
    quote: { icon: Quote, label: "引用", color: "text-primary" },
    code: { icon: Code, label: "コード", color: "text-primary" },
    component: { icon: Component, label: "コンポーネント", color: "text-primary" },
  }
  return configs[type]
}

// Filter commands by search query
export function filterCommands(commands: EditorCommand[], query: string): EditorCommand[] {
  if (!query) return commands
  const lower = query.toLowerCase()
  return commands.filter(
    (item) =>
      item.title.toLowerCase().includes(lower) ||
      item.description.toLowerCase().includes(lower) ||
      item.id.includes(lower)
  )
}

// ============================================
// Format Commands (for toolbar)
// ============================================

export const formatCommands: Record<string, FormatCommand> = {
  bold: {
    id: "bold",
    title: "太字",
    icon: <Bold className="h-4 w-4" />,
    wrap: "**",
    wrapEnd: "**",
  },
  italic: {
    id: "italic",
    title: "斜体",
    icon: <Italic className="h-4 w-4" />,
    wrap: "*",
    wrapEnd: "*",
  },
  strike: {
    id: "strike",
    title: "取り消し線",
    icon: <Strikethrough className="h-4 w-4" />,
    wrap: "~~",
    wrapEnd: "~~",
  },
  h1: {
    id: "h1",
    title: "見出し1",
    icon: <Heading1 className="h-4 w-4" />,
    insert: "# $0",
  },
  h2: {
    id: "h2",
    title: "見出し2",
    icon: <Heading2 className="h-4 w-4" />,
    insert: "## $0",
  },
  h3: {
    id: "h3",
    title: "見出し3",
    icon: <Heading3 className="h-4 w-4" />,
    insert: "### $0",
  },
  list: {
    id: "list",
    title: "箇条書き",
    icon: <List className="h-4 w-4" />,
    insert: "- $0",
  },
  "ordered-list": {
    id: "ordered-list",
    title: "番号リスト",
    icon: <ListOrdered className="h-4 w-4" />,
    insert: "1. $0",
  },
  checklist: {
    id: "checklist",
    title: "チェックリスト",
    icon: <CheckSquare className="h-4 w-4" />,
    insert: "- [ ] $0",
  },
  quote: {
    id: "quote",
    title: "引用",
    icon: <Quote className="h-4 w-4" />,
    insert: "> $0",
  },
  code: {
    id: "code",
    title: "コード",
    icon: <Code className="h-4 w-4" />,
    wrap: "```\n$0",
    wrapEnd: "\n```",
  },
  link: {
    id: "link",
    title: "リンク",
    icon: <Link className="h-4 w-4" />,
    wrap: "[$0",
    wrapEnd: "](url)",
  },
  image: {
    id: "image",
    title: "画像",
    icon: <Image className="h-4 w-4" />,
    insert: "![Alt$0](url)",
  },
}

// Get format command by ID
export function getFormatCommand(id: string): FormatCommand | undefined {
  return formatCommands[id]
}

// Apply format to textarea selection
export function applyFormat(
  textarea: HTMLTextAreaElement,
  formatId: string
): { newValue: string; newCursor: number } | null {
  const cmd = formatCommands[formatId]
  if (!cmd) return null

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value
  const selection = value.substring(start, end)

  let newValue = ""
  let newCursor = end

  if (cmd.wrap) {
    // Wrap command (bold, italic, code, link, etc.)
    const wrap = cmd.wrap
    const wrapEnd = cmd.wrapEnd || wrap

    // Process $0 in wrap if present
    const { text: processedWrap, cursorOffset: wrapCursorOffset } = processTemplate(wrap)
    const { text: processedWrapEnd } = processTemplate(wrapEnd)

    newValue = value.substring(0, start) + processedWrap + selection + processedWrapEnd + value.substring(end)

    if (wrap.includes(CURSOR_MARKER)) {
      // Cursor should be at $0 position within wrap
      newCursor = start + wrapCursorOffset
    } else {
      // Cursor after the wrapped content
      newCursor = start + processedWrap.length + selection.length + processedWrapEnd.length
    }
  } else if (cmd.insert) {
    // Insert command (headings, lists, etc.)
    const { text: insertText, cursorOffset } = processTemplate(cmd.insert)
    newValue = value.substring(0, start) + insertText + value.substring(end)
    newCursor = start + cursorOffset
  }

  return { newValue, newCursor }
}
