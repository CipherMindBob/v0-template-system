"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CallToActionProps {
  title: string
  description?: string
  primaryButtonText: string
  primaryButtonLink: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
  backgroundColor?: string
  editMode?: boolean
}

export function CallToAction({
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundColor = "bg-primary",
  editMode = false,
}: CallToActionProps) {
  return (
    <div className="w-full my-12 group relative" data-component-type="call-to-action">
      {editMode && (
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
      )}

      <div
        className={cn(
          "px-4 py-12 md:py-16 rounded-lg text-center",
          backgroundColor === "bg-primary" ? "bg-primary text-primary-foreground" : backgroundColor,
        )}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {description && <p className="text-lg mb-8 opacity-90">{description}</p>}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className={backgroundColor === "bg-primary" ? "bg-white text-primary hover:bg-gray-100" : ""}
            >
              <a href={primaryButtonLink}>{primaryButtonText}</a>
            </Button>

            {secondaryButtonText && (
              <Button
                size="lg"
                variant="outline"
                asChild
                className={backgroundColor === "bg-primary" ? "border-white text-white hover:bg-primary/90" : ""}
              >
                <a href={secondaryButtonLink || "#"}>{secondaryButtonText}</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
