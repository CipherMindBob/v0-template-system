"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Slide {
  url: string
  alt: string
}

interface SlideViewerProps {
  title?: string
  backgroundColor?: string
  autoplay?: boolean
  navigation?: boolean
  pagination?: boolean
  slides?: Slide[]
  editMode?: boolean
}

export function SlideViewer({
  title,
  backgroundColor = "bg-muted",
  autoplay = false,
  navigation = true,
  pagination = true,
  slides = [], // Add default empty array
  editMode = false,
}: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  // Handle autoplay - add null check for slides
  useEffect(() => {
    if (autoplay && slides && slides.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [autoplay, slides])

  // Navigate to previous slide - add null check for slides
  const prevSlide = () => {
    if (!slides || slides.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Navigate to next slide - add null check for slides
  const nextSlide = () => {
    if (!slides || slides.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  // Add a check for empty slides
  if (!slides || slides.length === 0) {
    return (
      <div className={cn("py-12 px-4 md:px-6", backgroundColor)}>
        <div className="max-w-6xl mx-auto">
          {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No slides available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("py-12 px-4 md:px-6", backgroundColor)}>
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}

        <div className="relative">
          {/* Slides */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none",
                )}
              >
                <Image src={slide.url || "/placeholder.svg"} alt={slide.alt} fill className="object-cover" />
              </div>
            ))}
          </div>

          {/* Navigation buttons - add check for slides.length */}
          {navigation && slides.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full"
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Pagination dots - add check for slides.length */}
        {pagination && slides.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index === currentSlide ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
