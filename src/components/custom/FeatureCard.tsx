interface FeatureCardProps {
  icon?: string
  title: string
  children: React.ReactNode
}

export function FeatureCard({ icon, title, children }: FeatureCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      {icon && <div className="mb-3 text-3xl">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  )
}
