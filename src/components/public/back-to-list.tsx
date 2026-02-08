import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BackToListProps {
  href: string
  label: string
}

export function BackToList({ href, label }: BackToListProps) {
  return (
    <footer className="mt-12 pt-8 border-t">
      <Button asChild variant="outline">
        <Link href={href}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {label}
        </Link>
      </Button>
    </footer>
  )
}
