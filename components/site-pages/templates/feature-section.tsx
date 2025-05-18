import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface FeatureSectionProps {
  title: string
  description: string
  image?: string
  imageAlt?: string
  buttonText?: string
  buttonLink?: string
  links?: Array<{ text: string; href: string }>
  reversed?: boolean
  delay?: number
}

export function FeatureSection({
  title,
  description,
  image,
  imageAlt = "Feature image",
  buttonText,
  buttonLink,
  links,
  reversed = false,
  delay = 0,
}: FeatureSectionProps) {
  return (
    <div className="py-12 px-4 md:px-6">
      <div
        className={`max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center ${reversed ? "md:grid-flow-dense" : ""}`}
      >
        <div className={reversed ? "md:col-start-2" : ""}>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground mb-6">{description}</p>

          {buttonText && (
            <Button asChild className="mb-4">
              <a href={buttonLink || "#"}>{buttonText}</a>
            </Button>
          )}

          {links && links.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {links.map((link, index) => (
                <Link key={index} href={link.href} className="text-primary hover:underline flex items-center">
                  {link.text}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={reversed ? "md:col-start-1" : ""}>
          {image && (
            <div className="rounded-lg overflow-hidden">
              <Image
                src={image || "/placeholder.svg"}
                alt={imageAlt}
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
