import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

export function Breadcrumb({
  items,
  showHome = false,
  className = "",
}: BreadcrumbProps) {
  if (items.length === 0) {
    return null
  }

  const allItems = showHome
    ? [{ label: "ホーム", href: "/" }, ...items]
    : items

  return (
    <nav aria-label="パンくずリスト" className={className}>
      <ol className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1

          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              )}
              {isLast ? (
                <span
                  className="text-foreground font-medium truncate max-w-[200px]"
                  title={item.label}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors truncate max-w-[200px]"
                  title={item.label}
                >
                  {index === 0 && showHome ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
