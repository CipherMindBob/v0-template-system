"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { TemplateWizard } from "@/components/template-wizard/wizard"
import { PageNavigation } from "@/components/page-management/page-navigation"
import { toast } from "@/components/ui/use-toast"
import { useWebsiteStore } from "@/lib/siteStorage"
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { LivePreview } from "@/components/template-wizard/live-preview"

export default function CreatePage() {
  const router = useRouter()

  // Get data directly from the store
  const websiteData = useWebsiteStore((state) => state.websiteData)
  const navigation = useWebsiteStore((state) => state.navigation)
  const activePage = useWebsiteStore((state) => state.metadata.activePage)
  const setNavigation = useWebsiteStore((state) => state.setNavigation)
  const setActivePage = useWebsiteStore((state) => state.setActivePage)

  const [step, setStep] = useState<"info" | "design">("info")
  const [isLoading, setIsLoading] = useState(false)
  const [siteInfo, setSiteInfo] = useState({
    name: "",
    description: "",
    template: "business",
    subdomain: "",
  })
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewKey, setPreviewKey] = useState(Date.now())

  // Initialize navigation if empty
  useEffect(() => {
    if (navigation.pages.length === 0 && Object.keys(websiteData).length > 0) {
      const pages = Object.keys(websiteData).map((pageId, index) => ({
        id: pageId,
        title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
        slug: pageId,
        isHomePage: pageId === "home",
        order: index,
      }))

      setNavigation({ pages })
    }
  }, [websiteData, navigation.pages.length, setNavigation])

  useEffect(() => {
    if (navigation.pages.length === 0) {
      const defaultPages = [
        { id: "home", title: "Home", slug: "home", isHomePage: true, order: 0 },
        { id: "about", title: "About", slug: "about", isHomePage: false, order: 1 },
        { id: "services", title: "Services", slug: "services", isHomePage: false, order: 2 },
        { id: "contact", title: "Contact", slug: "contact", isHomePage: false, order: 3 },
      ]
      setNavigation({ pages: defaultPages })
    }
  }, [navigation.pages.length, setNavigation])

  const handleInfoChange = (field: string, value: string) => {
    setSiteInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      // This would be a server action in the full implementation
      // await createSiteWithPages(siteInfo)

      toast({
        title: "Site created successfully!",
        description: `Your site "${siteInfo.name}" has been created.`,
      })

      // Redirect to the site editor
      router.push(`/app/sites/${encodeURIComponent(siteInfo.subdomain)}/edit`)
    } catch (error) {
      console.error("Error creating site:", error)
      toast({
        title: "Error creating site",
        description: "There was a problem creating your site. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Simple manual refresh function
  const handleManualRefresh = () => {
    setPreviewKey(Date.now())
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Site</h1>

      <Tabs value={step} onValueChange={(value) => setStep(value as "info" | "design")}>
        <TabsList className="mb-6">
          <TabsTrigger value="info">Site Information</TabsTrigger>
          <TabsTrigger value="design" disabled={!siteInfo.name || !siteInfo.subdomain}>
            Design & Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Site Name</Label>
              <Input
                id="name"
                value={siteInfo.name}
                onChange={(e) => handleInfoChange("name", e.target.value)}
                placeholder="My Awesome Site"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={siteInfo.description}
                onChange={(e) => handleInfoChange("description", e.target.value)}
                placeholder="Describe your site..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center">
                <Input
                  id="subdomain"
                  value={siteInfo.subdomain}
                  onChange={(e) =>
                    handleInfoChange("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="my-site"
                  className="rounded-r-none"
                />
                <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">.yourdomain.com</div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="template">Template</Label>
              <Select value={siteInfo.template} onValueChange={(value) => handleInfoChange("template", value)}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="ecommerce">E-Commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep("design")} disabled={!siteInfo.name || !siteInfo.subdomain}>
              Continue to Design
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="design">
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Template Preview</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleManualRefresh} className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                    className="flex items-center gap-1"
                  >
                    {isPreviewExpanded ? (
                      <>
                        <span>Collapse Preview</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Expand Preview</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isPreviewExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="aspect-video bg-muted rounded-md overflow-hidden">
                  {siteInfo.template ? (
                    <div className="w-full h-full relative">
                      <div className="absolute top-0 right-0 z-10 p-2 flex gap-2">
                        <Select value={previewDevice} onValueChange={setPreviewDevice}>
                          <SelectTrigger className="w-[110px] h-8 bg-white/80 backdrop-blur-sm">
                            <SelectValue placeholder="Device" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desktop">Desktop</SelectItem>
                            <SelectItem value="tablet">Tablet</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="absolute inset-0 p-4 overflow-auto">
                        <div
                          className={cn({
                            "scale-[0.6] origin-top-left": previewDevice === "desktop",
                            "scale-[0.8] origin-top": previewDevice === "tablet",
                            "scale-[1] origin-top": previewDevice === "mobile",
                          })}
                        >
                          {/* Use the LivePreview component to ensure consistency */}
                          <div className="bg-primary/90 text-white p-6 rounded-t-md">
                            <div className="flex justify-between items-center">
                              <div className="font-bold text-xl">{siteInfo.name || "Website"}</div>
                              <PageNavigation
                                currentPageId={activePage}
                                onPageSelect={(pageId) => {
                                  setActivePage(pageId)
                                  setIsPreviewLoading(true)
                                  setTimeout(() => setIsPreviewLoading(false), 300)
                                }}
                              />
                            </div>
                          </div>

                          {isPreviewLoading ? (
                            <div className="bg-white p-12 flex flex-col items-center justify-center min-h-[400px]">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                              <p className="mt-4 text-muted-foreground">Loading page content...</p>
                            </div>
                          ) : (
                            <LivePreview
                              key={previewKey}
                              page={activePage}
                              viewportSize={previewDevice}
                              editMode={false}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Select a template to see preview</p>
                    </div>
                  )}
                </div>
              </div>

              {!isPreviewExpanded && (
                <div className="mt-2 text-center text-sm text-muted-foreground">
                  <p>Click "Expand Preview" to see how your site will look</p>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Customize Template</h2>
              <TemplateWizard
                siteId="new-site"
                siteName={siteInfo.name}
                templateType={siteInfo.template}
                onUpdate={handleManualRefresh}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("info")}>
                Back to Information
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Site"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
