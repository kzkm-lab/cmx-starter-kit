"use client"

import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Check, Copy } from "lucide-react"

type MarkdownProps = {
  children: React.ReactNode
  className?: string
}

type CodeBlockProps = {
  node?: any
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

const CodeBlock = ({ node, inline, className, children, ...props }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false)
  const raw = Array.isArray(children) ? children.join("") : String(children ?? "")
  const looksMultiline = /[\r\n]/.test(raw)
  const inlineDetected = inline || (node && node.type === "inlineCode")
  const shouldInline = inlineDetected || !looksMultiline

  if (shouldInline) {
    return (
      <code
        className={`font-mono text-[0.9em] px-1.5 py-0.5 rounded bg-secondary text-foreground border border-border whitespace-pre-wrap break-words ${
          className || ""
        }`}
        {...props}
      >
        {children}
      </code>
    )
  }

  const match = /language-(\w+)/.exec(className || "")
  const language = match ? match[1] : "text"
  const textToCopy = raw

  const handleCopy = () => {
    const doSet = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(doSet)
          .catch(() => {
            fallbackCopy(textToCopy)
            doSet()
          })
      } else {
        fallbackCopy(textToCopy)
        doSet()
      }
    } catch {
      fallbackCopy(textToCopy)
      doSet()
    }
  }

  const fallbackCopy = (text: string) => {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand("copy")
    } catch {}
    document.body.removeChild(ta)
  }

  return (
    <div className="relative group my-2">
      {language && language !== "text" && (
        <div className="absolute top-2 left-3 z-10 text-[10px] text-muted-foreground font-medium uppercase">
          {language}
        </div>
      )}

      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 active:opacity-100 transition-opacity text-[10px] px-2 py-1 rounded bg-secondary hover:bg-accent border border-border flex items-center gap-1"
        title={copied ? "コピーしました" : "コードをコピー"}
        aria-label={copied ? "コピーしました" : "コードをコピー"}
      >
        {copied ? (
          <>
            <Check className="w-3 h-3" />
            <span>コピーしました</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>コピー</span>
          </>
        )}
      </button>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: "0.375rem",
          fontSize: "0.75rem",
          padding: language && language !== "text" ? "2rem 1rem 1rem 1rem" : "1rem",
          background: "hsl(var(--secondary))",
        }}
        codeTagProps={{
          style: {
            fontFamily: "ui-monospace, monospace",
          },
        }}
      >
        {raw}
      </SyntaxHighlighter>
    </div>
  )
}

const markdownComponents = {
  code: CodeBlock,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-2">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="text-blue-500 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <div className="mb-2 last:mb-0">{children}</div>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full border-collapse border border-border">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-secondary">{children}</thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold border border-border">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-3 py-2 align-top text-xs border border-border">{children}</td>
  ),
}

export function Markdown({ children, className }: MarkdownProps) {
  const content = String(children ?? "")

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents as any}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
