"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { nanoid } from "nanoid"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ComponentLibrary } from "@/components/template-wizard/component-library"
import { PropertyEditor } from "@/components/template-wizard/property-editor"
import { LivePreview } from "@/components/template-wizard/live-preview"
import { PageManager } from "@/components/page-management/page-manager"
import { useWebsiteStore, useWebsiteMetadata, useActivePageComponents, createCachedSelector } from "@/lib/siteStorage"
import { Save, AlertTriangle, RefreshCw, Layers, Settings, FileText } from "lucide-react"

interface TemplateWizardProps {
  siteId: string
  siteName?: string
  templateType?: string
  onUpdate?: () => void
}

export function TemplateWizard({ siteId, siteName, templateType = "business", onUpdate }: TemplateWizardProps) {
  // UI state
  const [viewportSize, setViewportSize] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeTab, setActiveTab] = useState("components")
  const [previewKey, setPreviewKey] = useState(Date.now())

  // Use refs to track initialization state
  const isInitializedRef = useRef(false)
  const isFirstRenderRef = useRef(true)
  const backupPromptShown = useRef(false)
  const pageInitializedRef = useRef(false)

  // Get data from store using cached selectors
  const websiteData = useWebsiteStore(createCachedSelector("websiteData", (state) => state.websiteData))
  const metadata = useWebsiteMetadata()
  const activePageComponents = useActivePageComponents()

  // Extract values from metadata safely
  const activePage = metadata?.activePage || "home"
  const activeComponentId = metadata?.activeComponentId || null
  const version = metadata?.version || 0
  const prevVersionRef = useRef(version)

  // Get actions from store - these don't need caching as they don't trigger re-renders
  const setWebsiteData = useWebsiteStore((state) => state.setWebsiteData)
  const setActivePage = useWebsiteStore((state) => state.setActivePage)
  const setActiveComponent = useWebsiteStore((state) => state.setActiveComponent)
  const addComponent = useWebsiteStore((state) => state.addComponent)
  const removeComponent = useWebsiteStore((state) => state.removeComponent)
  const moveComponent = useWebsiteStore((state) => state.moveComponent)
  const hasLocalBackup = useWebsiteStore((state) => state.hasLocalBackup)
  const restoreFromLocalBackup = useWebsiteStore((state) => state.restoreFromLocalBackup)
  const clearLocalBackup = useWebsiteStore((state) => state.clearLocalBackup)

  // 1. INITIALIZATION EFFECT - Runs only once on mount
  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    // Check for local backup
    if (hasLocalBackup && !backupPromptShown.current) {
      backupPromptShown.current = true

      // Ask user if they want to restore from backup
      if (confirm("We found a backup of your unsaved changes. Would you like to restore them?")) {
        restoreFromLocalBackup()
        toast({
          title: "Backup restored",
          description: "Your unsaved changes have been restored.",
        })
      } else {
        clearLocalBackup()
      }
    }

    // If no website data is loaded, initialize with default data
    if (Object.keys(websiteData || {}).length === 0) {
      setWebsiteData(getDefaultWebsiteData(templateType))
    }
  }, []) // Empty dependency array - runs once on mount

  // 2. BEFOREUNLOAD WARNING - Only re-attaches when hasUnsavedChanges changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  // 3. VERSION CHANGE DETECTOR - Carefully watches version changes
  useEffect(() => {
    // Skip the first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      prevVersionRef.current = version
      return
    }

    // Only update if version actually changed
    if (prevVersionRef.current !== version) {
      prevVersionRef.current = version
      setHasUnsavedChanges(true)
      setPreviewKey(Date.now())

      // Notify parent component of updates
      if (onUpdate) {
        onUpdate()
      }
    }
  }, [version, onUpdate])

  // 4. PAGE INITIALIZATION - Ensure we have a valid page
  useEffect(() => {
    // Only run once
    if (pageInitializedRef.current) return

    // If we have website data, we can initialize the page
    if (websiteData && Object.keys(websiteData).length > 0) {
      pageInitializedRef.current = true

      // If we don't have an active page, set the default
      if (!activePage || !websiteData[activePage]) {
        const firstPage = Object.keys(websiteData)[0] || "home"
        setActivePage(firstPage)
      }
    }
  }, [activePage, websiteData, setActivePage])

  // Memoized handlers to prevent recreation on each render
  const handlePageSelect = useCallback(
    (pageId: string) => {
      if (!pageId) return

      setActivePage(pageId)

      // If the page doesn't exist in websiteData, initialize it
      if (websiteData && !websiteData[pageId]) {
        const updatedWebsiteData = { ...websiteData }
        updatedWebsiteData[pageId] = { components: [] }
        setWebsiteData(updatedWebsiteData)
      }
    },
    [websiteData, setActivePage, setWebsiteData],
  )

  const handleAddComponent = useCallback(
    (componentType: string) => {
      if (!componentType || !activePage) return

      const newComponentId = `${componentType}-${nanoid(6)}`
      addComponent(activePage, {
        id: newComponentId,
        type: componentType,
        properties: getDefaultPropertiesForComponent(componentType),
      })

      toast({
        title: "Component added",
        description: `Added ${componentType} component to the page.`,
      })

      // Select the newly added component
      setActiveComponent(newComponentId)
      setActiveTab("properties")
    },
    [activePage, addComponent, setActiveComponent],
  )

  const handleRemoveComponent = useCallback(
    (componentId: string) => {
      if (!componentId || !activePage) return

      if (confirm("Are you sure you want to remove this component?")) {
        removeComponent(activePage, componentId)
        toast({
          title: "Component removed",
          description: "The component has been removed from the page.",
        })
      }
    },
    [activePage, removeComponent],
  )

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true)

      // This would call a server action in the full implementation
      // await saveWebsiteData(siteId, websiteData)

      setHasUnsavedChanges(false)
      clearLocalBackup()

      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving website data:", error)
      toast({
        title: "Error saving changes",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [clearLocalBackup])

  const handleComponentDragEnd = useCallback(
    (event: any) => {
      if (!event.active || !event.over || !activePage) return

      const sourceId = event.active.id
      const destinationId = event.over.id

      if (sourceId === destinationId) return

      // Find the indices of the source and destination components
      const components = websiteData?.[activePage]?.components || []
      const sourceIndex = components.findIndex((c) => c.id === sourceId)
      const destinationIndex = components.findIndex((c) => c.id === destinationId)

      if (sourceIndex !== -1 && destinationIndex !== -1) {
        moveComponent(activePage, sourceIndex, destinationIndex)

        // Show a toast notification
        toast({
          title: "Component reordered",
          description: "The component has been moved to a new position.",
        })
      }
    },
    [activePage, websiteData, moveComponent],
  )

  // Handle component selection
  const handleSelectComponent = useCallback(
    (componentId: string | null) => {
      setActiveComponent(componentId)
    },
    [setActiveComponent],
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      {/* Sidebar */}
      <div className="lg:col-span-3 border rounded-lg overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="components">
          <TabsList className="w-full">
            <TabsTrigger
              value="pages"
              className="flex-1"
              onClick={() => {
                // Clear component selection when switching to pages tab
                if (activeComponentId) {
                  setActiveComponent(null)
                }
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="components" className="flex-1">
              <Layers className="h-4 w-4 mr-2" />
              Components
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Properties
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="p-4">
            <PageManager siteId={siteId} onPageSelect={handlePageSelect} selectedPageId={activePage} />
          </TabsContent>

          <TabsContent value="components" className="p-4">
            <ComponentLibrary onAddComponent={handleAddComponent} />
          </TabsContent>

          <TabsContent value="properties" className="p-4">
            {activeComponentId ? (
              <PropertyEditor
                componentId={activeComponentId}
                page={activePage}
                siteId={siteId}
                onSelectComponent={handleSelectComponent}
                onRemoveComponent={handleRemoveComponent}
              />
            ) : (
              <div className="text-center text-muted-foreground p-4">Select a component to edit its properties</div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-9 border rounded-lg overflow-hidden">
        <div className="p-2 border-b flex items-center justify-between">
          <h3 className="font-medium">
            {activePage ? activePage.charAt(0).toUpperCase() + activePage.slice(1) : "Loading..."} Page
          </h3>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewportSize === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewportSize("desktop")}
            >
              Desktop
            </Button>
            <Button
              variant={viewportSize === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewportSize("tablet")}
            >
              Tablet
            </Button>
            <Button
              variant={viewportSize === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewportSize("mobile")}
            >
              Mobile
            </Button>
          </div>
        </div>

        <div className="p-4 bg-muted h-[calc(100%-3rem)] overflow-auto">
          {activePage && (
            <LivePreview
              key={previewKey}
              page={activePage}
              viewportSize={viewportSize}
              editMode={true}
              onSelectComponent={handleSelectComponent}
              selectedComponentId={activeComponentId}
              onDragEnd={handleComponentDragEnd}
              components={activePageComponents}
            />
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="lg:col-span-12 flex justify-between">
        <div>
          {hasUnsavedChanges && (
            <div className="flex items-center text-amber-500">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Helper functions remain the same
function getDefaultWebsiteData(template = "business") {
  const defaultWebsiteData: Record<string, { components: any[] }> = {
    home: {
      components: [
        {
          id: "hero-section-1",
          type: "hero-section",
          properties: {
            title: "Welcome to Our Website",
            subtitle: "We're revolutionizing the future with innovative solutions",
            buttonText: "Learn More",
            buttonLink: "#about",
            backgroundPattern: "/subtle-pattern.svg",
          },
        },
        {
          id: "team-showcase-1",
          type: "team-showcase",
          properties: {
            title: "Meet Our Visionary Team",
            members: getStandardTeamMembers("showcase"),
          },
        },
      ],
    },
    about: {
      components: [
        {
          id: "about-header-1",
          type: "header",
          properties: {
            title: "About Us",
            subtitle: "Learn more about our company",
          },
        },
        {
          id: "feature-section-1",
          type: "feature-section",
          properties: {
            title: "Our Mission",
            description: "We're building the future of human connection.",
            image: "/abstract-digital-pattern.png",
            imageAlt: "Our mission illustration",
            buttonText: "Learn more",
            buttonLink: "/learn-more",
            reversed: false,
          },
        },
      ],
    },
    services: {
      components: [
        {
          id: "services-header-1",
          type: "header",
          properties: {
            title: "Our Services",
            subtitle: "What we can do for you",
          },
        },
        {
          id: "services-list-1",
          type: "servicesList",
          properties: {
            services: [
              {
                title: "Service 1",
                description: "Description of service 1",
                icon: "Briefcase",
              },
              {
                title: "Service 2",
                description: "Description of service 2",
                icon: "Code",
              },
              {
                title: "Service 3",
                description: "Description of service 3",
                icon: "PenTool",
              },
            ],
          },
        },
      ],
    },
    contact: {
      components: [
        {
          id: "contact-header-1",
          type: "header",
          properties: {
            title: "Contact Us",
            subtitle: "Get in touch with our team",
          },
        },
        {
          id: "contact-form-1",
          type: "contact-form",
          properties: {
            title: "Send us a message",
            submitButtonText: "Send Message",
            successMessage: "Thank you for your message. We'll get back to you soon!",
          },
        },
      ],
    },
  }

  return defaultWebsiteData
}

function getDefaultPropertiesForComponent(componentType: string) {
  switch (componentType) {
    case "hero-section":
      return {
        title: "New Hero Section",
        subtitle: "Add a subtitle here",
        buttonText: "Call to Action",
        buttonLink: "/",
        backgroundPattern: "/subtle-pattern.svg",
      }
    case "header":
      return {
        title: "New Section Header",
        subtitle: "Add a subtitle here",
        alignment: "center",
        size: "medium",
      }
    case "feature-section":
      return {
        title: "Feature Section",
        description: "Add your description here",
        image: "/abstract-digital-pattern.png",
        imageAlt: "Feature image",
        buttonText: "Learn More",
        buttonLink: "#",
        reversed: false,
      }
    case "team-showcase":
      return {
        title: "Meet Our Team",
        members: getStandardTeamMembers("showcase"),
      }
    case "video-player":
      return {
        title: "Video Player",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "/video-thumbnail.png",
        autoplay: false,
        controls: true,
      }
    case "calendar":
      return {
        title: "Event Calendar",
        events: [
          {
            id: "1",
            title: "Team Meeting",
            date: new Date(Date.now() + 86400000).toISOString(),
            description: "Weekly team sync",
          },
          {
            id: "2",
            title: "Product Launch",
            date: new Date(Date.now() + 86400000 * 7).toISOString(),
            description: "New product release",
          },
        ],
        viewType: "month",
      }
    case "email-form":
      return {
        title: "Contact via Email",
        recipientEmail: "contact@example.com",
        subjectPrefix: "[Website Inquiry]",
        submitButtonText: "Send Email",
        successMessage: "Your email has been sent successfully!",
        fields: [
          { name: "name", label: "Your Name", type: "text", required: true },
          { name: "email", label: "Your Email", type: "email", required: true },
          { name: "message", label: "Message", type: "textarea", required: true },
        ],
      }
    case "chat-interface":
      return {
        title: "Live Chat",
        welcomeMessage: "Hello! How can we help you today?",
        agentName: "Support Team",
        agentAvatar: "/support-avatar.png",
        showTimestamp: true,
      }
    case "call-to-action":
      return {
        title: "Ready to Get Started?",
        description: "Join thousands of satisfied customers using our platform.",
        primaryButtonText: "Sign Up Now",
        primaryButtonLink: "/signup",
        secondaryButtonText: "Learn More",
        secondaryButtonLink: "/about",
        backgroundColor: "bg-primary",
      }
    case "pricing-table":
      return {
        title: "Choose Your Plan",
        description: "Select the perfect plan for your needs",
        plans: [
          {
            name: "Basic",
            price: "$9.99",
            period: "monthly",
            description: "Perfect for individuals",
            features: ["Feature 1", "Feature 2", "Feature 3"],
            buttonText: "Get Started",
            buttonLink: "/signup?plan=basic",
            highlighted: false,
          },
          {
            name: "Pro",
            price: "$19.99",
            period: "monthly",
            description: "Ideal for small teams",
            features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
            buttonText: "Get Started",
            buttonLink: "/signup?plan=pro",
            highlighted: true,
          },
        ],
      }
    default:
      return {}
  }
}

function getStandardTeamMembers(type: string) {
  return [
    {
      name: "John Doe",
      role: "CEO & Founder",
      image: "/professional-male-headshot.png",
      slug: "john-doe",
      bio: "John has over 15 years of experience in the industry.",
    },
    {
      name: "Jane Smith",
      role: "CTO",
      image: "/professional-headshot-female.png",
      slug: "jane-smith",
      bio: "Jane leads our technical team with expertise in AI and machine learning.",
    },
    {
      name: "Michael Johnson",
      role: "Design Director",
      image: "/diverse-male-headshot.png",
      slug: "michael-johnson",
      bio: "Michael brings creative vision to all our projects.",
    },
  ]
}
