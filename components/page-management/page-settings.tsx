"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { useWebsiteStore } from "@/lib/siteStorage"
import { FileText, Globe, Share2, Lock, Settings } from "lucide-react"

interface PageSettingsProps {
  pageId: string
  onClose: () => void
}

export function PageSettings({ pageId, onClose }: PageSettingsProps) {
  const { navigation, updatePage } = useWebsiteStore()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    title: "",
    slug: "",
    description: "",
    isPublished: true,
    requiresAuth: false,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  })

  // Find the page in navigation
  const page = navigation.pages.find((p) => p.id === pageId)

  if (!page) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Page not found</p>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    )
  }

  // Initialize settings state with page data
  useState(() => {
    setSettings({
      title: page.title,
      slug: page.slug,
      description: page.description || "",
      isPublished: true,
      requiresAuth: false,
      metaTitle: page.title,
      metaDescription: page.description || "",
      ogImage: "",
    })
  })

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Validate inputs
      if (!settings.title.trim()) {
        toast({
          title: "Error",
          description: "Page title is required",
          variant: "destructive",
        })
        return
      }

      // Update page in store
      updatePage(pageId, {
        title: settings.title,
        slug: settings.slug,
        description: settings.description,
      })

      toast({
        title: "Success",
        description: "Page settings updated successfully",
      })

      onClose()
    } catch (error) {
      console.error("Error updating page settings:", error)
      toast({
        title: "Error",
        description: "Failed to update page settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Page Settings
        </CardTitle>
        <CardDescription>Configure settings for the "{page.title}" page</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">
              <FileText className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Globe className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="sharing">
              <Share2 className="h-4 w-4 mr-2" />
              Sharing
            </TabsTrigger>
            <TabsTrigger value="access">
              <Lock className="h-4 w-4 mr-2" />
              Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                disabled={page.isHomePage}
              />
              {page.isHomePage && (
                <p className="text-xs text-muted-foreground">The home page title cannot be changed</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">
                Page URL <span className="text-xs text-muted-foreground">(slug)</span>
              </Label>
              <Input
                id="slug"
                value={settings.slug}
                onChange={(e) => setSettings({ ...settings, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                disabled={page.isHomePage}
              />
              {page.isHomePage && <p className="text-xs text-muted-foreground">The home page URL cannot be changed</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-xs text-muted-foreground">(internal only)</span>
              </Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={3}
                placeholder="Internal description for this page"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={settings.isPublished}
                onCheckedChange={(checked) => setSettings({ ...settings, isPublished: checked })}
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={settings.metaTitle}
                onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                placeholder="SEO title for search engines"
              />
              <p className="text-xs text-muted-foreground">Recommended length: 50-60 characters</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={settings.metaDescription}
                onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                rows={3}
                placeholder="SEO description for search engines"
              />
              <p className="text-xs text-muted-foreground">Recommended length: 150-160 characters</p>
            </div>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="ogImage">Social Media Image</Label>
              <Input
                id="ogImage"
                value={settings.ogImage}
                onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
                placeholder="URL to image for social media sharing"
              />
              <p className="text-xs text-muted-foreground">Recommended size: 1200 x 630 pixels</p>
            </div>

            <div className="p-4 border rounded-md bg-muted/50">
              <h4 className="font-medium mb-2">Social Media Preview</h4>
              <div className="border rounded-md p-3 bg-background">
                <div className="h-32 bg-muted rounded-md mb-2 flex items-center justify-center text-muted-foreground text-sm">
                  {settings.ogImage ? "Image Preview" : "No image set"}
                </div>
                <h5 className="font-medium text-sm">{settings.metaTitle || settings.title}</h5>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {settings.metaDescription || settings.description || "No description set"}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="requiresAuth"
                checked={settings.requiresAuth}
                onCheckedChange={(checked) => setSettings({ ...settings, requiresAuth: checked })}
              />
              <Label htmlFor="requiresAuth">Require Authentication</Label>
            </div>
            <p className="text-sm text-muted-foreground">When enabled, users must be logged in to view this page.</p>

            <div className="p-4 border rounded-md bg-muted/50 mt-4">
              <h4 className="font-medium mb-2">Advanced Access Control</h4>
              <p className="text-sm text-muted-foreground mb-4">Configure role-based access control for this page.</p>
              <Button variant="outline" size="sm" disabled>
                Configure Access Control
              </Button>
              <p className="text-xs text-muted-foreground mt-2">This feature is coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}
