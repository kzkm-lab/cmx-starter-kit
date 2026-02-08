"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  href: string
  className?: string
}

export function BackButton({ href, className }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "h-9 w-9 border border-border bg-background",
        "text-muted-foreground hover:text-foreground hover:bg-accent",
        "transition-colors shrink-0",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">戻る</span>
    </Link>
  )
}
