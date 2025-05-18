import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  title: string
  subtitle: string
  buttonText?: string
  buttonLink?: string
  backgroundPattern?: string
  editMode?: boolean
}

export function HeroSection({
  title,
  subtitle,
  buttonText,
  buttonLink,
  backgroundPattern,
  editMode = false,
}: HeroSectionProps) {
  return (
    <div
      className="relative py-20 px-4 md:px-6 lg:px-8 flex items-center justify-center min-h-[60vh] group"
      style={{
        backgroundImage: backgroundPattern ? `url(${backgroundPattern})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      data-component-type="hero-section"
    >
      <div className="absolute inset-0 bg-black/50">
        {/* Drag handle that only appears in edit mode */}
        <div
          className="drag-handle absolute top-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex items-center gap-1 z-20"
          data-drag-handle
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-grip"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="19" cy="5" r="1" />
            <circle cx="5" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
            <circle cx="19" cy="19" r="1" />
            <circle cx="5" cy="19" r="1" />
          </svg>
          Drag to reorder
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{title}</h1>
        <p className="text-xl md:text-2xl mb-8">{subtitle}</p>

        {buttonText && (
          <Button asChild size="lg">
            <a href={buttonLink || "#"}>{buttonText}</a>
          </Button>
        )}
      </div>
    </div>
  )
}
