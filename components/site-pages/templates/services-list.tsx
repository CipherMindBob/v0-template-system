import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Briefcase, Code, PenTool, Star } from "lucide-react"

interface Service {
  title: string
  description: string
  icon?: string
  features?: string[]
  buttonText?: string
  link?: string
  featured?: boolean
}

interface ServicesListProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaButtonText?: string
  ctaLink?: string
  layout?: "grid" | "list"
  columns?: number
  services: Service[]
}

export function ServicesList({
  title,
  subtitle,
  ctaText,
  ctaButtonText,
  ctaLink,
  layout = "grid",
  columns = 3,
  services,
}: ServicesListProps) {
  // Determine grid columns class
  const gridColumnsClass =
    {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
    }[columns] || "md:grid-cols-3"

  // Helper function to render icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Briefcase":
        return <Briefcase className="h-6 w-6" />
      case "Code":
        return <Code className="h-6 w-6" />
      case "PenTool":
        return <PenTool className="h-6 w-6" />
      case "Star":
        return <Star className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  return (
    <div className="py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {title && <h2 className="text-3xl font-bold mb-4 text-center">{title}</h2>}
        {subtitle && <p className="text-muted-foreground mb-8 text-center max-w-3xl mx-auto">{subtitle}</p>}

        {layout === "grid" ? (
          <div className={`grid grid-cols-1 ${gridColumnsClass} gap-6`}>
            {services.map((service, index) => (
              <Card key={index} className={service.featured ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  {service.icon && <div className="mb-2">{renderIcon(service.icon)}</div>}
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>

                  {service.features && service.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>

                {service.buttonText && (
                  <CardFooter>
                    <Button asChild variant={service.featured ? "default" : "outline"} className="w-full">
                      <a href={service.link || "#"}>{service.buttonText}</a>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {services.map((service, index) => (
              <Card key={index} className={service.featured ? "border-primary shadow-lg" : ""}>
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 md:w-1/3">
                    {service.icon && <div className="mb-2">{renderIcon(service.icon)}</div>}
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>

                    {service.buttonText && (
                      <Button asChild variant={service.featured ? "default" : "outline"} className="mt-4">
                        <a href={service.link || "#"}>{service.buttonText}</a>
                      </Button>
                    )}
                  </div>

                  {service.features && service.features.length > 0 && (
                    <div className="p-6 border-t md:border-t-0 md:border-l md:w-2/3">
                      <h4 className="font-medium mb-4">Features</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {ctaText && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">{ctaText}</p>
            {ctaButtonText && (
              <Button asChild>
                <a href={ctaLink || "#"}>{ctaButtonText}</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
