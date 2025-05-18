import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  subtitle?: string
  alignment?: "left" | "center" | "right"
  size?: "small" | "medium" | "large"
}

export function Header({ title, subtitle, alignment = "center", size = "medium" }: HeaderProps) {
  // Determine text alignment class
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[alignment]

  // Determine title size class
  const titleSizeClass = {
    small: "text-2xl md:text-3xl",
    medium: "text-3xl md:text-4xl",
    large: "text-4xl md:text-5xl",
  }[size]

  // Determine subtitle size class
  const subtitleSizeClass = {
    small: "text-base",
    medium: "text-lg",
    large: "text-xl",
  }[size]

  return (
    <div className={cn("py-10 px-4", alignmentClass)}>
      <h2 className={cn("font-bold mb-4", titleSizeClass)}>{title}</h2>

      {subtitle && <p className={cn("text-muted-foreground max-w-3xl mx-auto", subtitleSizeClass)}>{subtitle}</p>}
    </div>
  )
}
