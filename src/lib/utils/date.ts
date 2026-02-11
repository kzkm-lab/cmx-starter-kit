export type DateFormatStyle = "full" | "short" | "simple"

/**
 * Format a date string for display
 * @param date - Date string or Date object
 * @param style - Format style: "full" (2024年1月15日), "short" (Jan 15), "simple" (2024/1/15)
 * @param locale - Locale for formatting
 */
export function formatContentDate(
  date: string | Date,
  style: DateFormatStyle = "full",
  locale: "ja-JP" | "en-US" = "ja-JP"
): string {
  const d = typeof date === "string" ? new Date(date) : date

  const options: Record<DateFormatStyle, Intl.DateTimeFormatOptions | undefined> = {
    full: { year: "numeric", month: "long", day: "numeric" },
    short: { month: "short", day: "numeric" },
    simple: undefined,
  }

  return d.toLocaleDateString(locale, options[style])
}
