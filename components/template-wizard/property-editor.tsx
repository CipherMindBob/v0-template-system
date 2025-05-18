"use client"

import { memo, useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, ArrowLeft, Plus } from "lucide-react"
import { useWebsiteStore, createCachedSelector } from "@/lib/siteStorage"
import { Card, CardContent } from "@/components/ui/card"
import { getComponentDisplayName } from "@/components/template-wizard/component-registry"

interface PropertyEditorProps {
  componentId: string | null
  page: string
  siteId: string
  onSelectComponent: (componentId: string | null) => void
  onRemoveComponent: (componentId: string) => void
}

export const PropertyEditor = memo(function PropertyEditor({
  componentId,
  page,
  siteId,
  onSelectComponent,
  onRemoveComponent,
}: PropertyEditorProps) {
  // Local state for properties
  const [properties, setProperties] = useState<Record<string, any>>({})
  const [componentType, setComponentType] = useState<string>("")

  // Use a ref to track if we've initialized the component
  const initializedRef = useRef(false)
  const prevComponentIdRef = useRef<string | null>(null)
  const prevPageRef = useRef<string>("")

  // Get data from store using cached selector
  const websiteData = useWebsiteStore(
    createCachedSelector(`websiteData-${page}-${componentId}`, (state) => state.websiteData),
  )
  const updateComponentProperties = useWebsiteStore((state) => state.updateComponentProperties)

  // Find the component and update local state when it changes
  useEffect(() => {
    // Skip if no valid inputs
    if (!componentId || !page || !websiteData || !websiteData[page]) {
      setProperties({})
      setComponentType("")
      return
    }

    // Check if we need to update (component or page changed)
    const componentChanged = prevComponentIdRef.current !== componentId
    const pageChanged = prevPageRef.current !== page

    if (componentChanged || pageChanged) {
      // Update refs
      prevComponentIdRef.current = componentId
      prevPageRef.current = page

      // Find the component
      const component = websiteData[page].components?.find((c) => c.id === componentId)

      // Only update state if component exists
      if (component) {
        setProperties(component.properties || {})
        setComponentType(component.type || "")
        initializedRef.current = true
      } else {
        setProperties({})
        setComponentType("")
      }
    }
  }, [componentId, page, websiteData])

  // Handle property change - using useCallback to prevent recreation on each render
  const handlePropertyChange = useCallback(
    (key: string, value: any) => {
      if (!componentId || !page) return

      // Update local state first
      setProperties((prev) => {
        const newProperties = { ...prev, [key]: value }

        // Then update the store
        updateComponentProperties(page, componentId, newProperties)

        return newProperties
      })
    },
    [componentId, page, updateComponentProperties],
  )

  // Handle array item change
  const handleArrayItemChange = useCallback(
    (arrayName: string, index: number, key: string, value: any) => {
      if (!componentId || !page) return

      setProperties((prev) => {
        // Create a deep copy of the array
        const array = [...(prev[arrayName] || [])]

        // Update the specific item
        if (array[index]) {
          array[index] = { ...array[index], [key]: value }
        }

        const newProperties = { ...prev, [arrayName]: array }

        // Update the store
        updateComponentProperties(page, componentId, newProperties)

        return newProperties
      })
    },
    [componentId, page, updateComponentProperties],
  )

  // Handle going back
  const handleGoBack = useCallback(() => {
    onSelectComponent(null)
  }, [onSelectComponent])

  // If no component is selected or found
  if (!componentId || !componentType) {
    return <div className="p-4 text-center">Select a component to edit its properties.</div>
  }

  // Render different property editors based on component type
  const renderPropertyEditor = () => {
    switch (componentType) {
      case "hero-section":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={properties.title || ""}
                onChange={(e) => handlePropertyChange("title", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={properties.subtitle || ""}
                onChange={(e) => handlePropertyChange("subtitle", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={properties.buttonText || ""}
                onChange={(e) => handlePropertyChange("buttonText", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="buttonLink">Button Link</Label>
              <Input
                id="buttonLink"
                value={properties.buttonLink || ""}
                onChange={(e) => handlePropertyChange("buttonLink", e.target.value)}
              />
            </div>
          </div>
        )

      case "header":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={properties.title || ""}
                onChange={(e) => handlePropertyChange("title", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={properties.subtitle || ""}
                onChange={(e) => handlePropertyChange("subtitle", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="alignment">Alignment</Label>
              <Select
                value={properties.alignment || "center"}
                onValueChange={(value) => handlePropertyChange("alignment", value)}
              >
                <SelectTrigger id="alignment">
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="size">Size</Label>
              <Select
                value={properties.size || "medium"}
                onValueChange={(value) => handlePropertyChange("size", value)}
              >
                <SelectTrigger id="size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "feature-section":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={properties.title || ""}
                onChange={(e) => handlePropertyChange("title", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={properties.description || ""}
                onChange={(e) => handlePropertyChange("description", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={properties.image || ""}
                onChange={(e) => handlePropertyChange("image", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="imageAlt">Image Alt Text</Label>
              <Input
                id="imageAlt"
                value={properties.imageAlt || ""}
                onChange={(e) => handlePropertyChange("imageAlt", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={properties.buttonText || ""}
                onChange={(e) => handlePropertyChange("buttonText", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="buttonLink">Button Link</Label>
              <Input
                id="buttonLink"
                value={properties.buttonLink || ""}
                onChange={(e) => handlePropertyChange("buttonLink", e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="reversed"
                checked={properties.reversed || false}
                onCheckedChange={(checked) => handlePropertyChange("reversed", checked)}
              />
              <Label htmlFor="reversed">Reverse Layout</Label>
            </div>
          </div>
        )

      case "team-showcase":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Section Title</Label>
              <Input
                id="title"
                value={properties.title || ""}
                onChange={(e) => handlePropertyChange("title", e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Team Members</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Create a unique identifier for this new member
                    const timestamp = Date.now()
                    const randomId = Math.floor(Math.random() * 1000)
                    const uniqueSlug = `team-member-${timestamp}-${randomId}`

                    // Ensure we have a members array before adding
                    const currentMembers = Array.isArray(properties.members) ? properties.members : []
                    const updatedMembers = [
                      ...currentMembers,
                      {
                        name: `New Member ${randomId}`,
                        role: "Position",
                        image: "/professional-headshot.png",
                        slug: uniqueSlug,
                        bio: "Add biography here.",
                      },
                    ]

                    handlePropertyChange("members", updatedMembers)
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Member
                </Button>
              </div>

              {Array.isArray(properties.members) &&
                properties.members.map((member, index) => (
                  <Card key={member.slug || index} className="mt-2">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{member.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedMembers = [...properties.members]
                            updatedMembers.splice(index, 1)
                            handlePropertyChange("members", updatedMembers)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <Label htmlFor={`member-${index}-name`}>Name</Label>
                          <Input
                            id={`member-${index}-name`}
                            value={member.name || ""}
                            onChange={(e) => {
                              handleArrayItemChange("members", index, "name", e.target.value)
                            }}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`member-${index}-role`}>Role</Label>
                          <Input
                            id={`member-${index}-role`}
                            value={member.role || ""}
                            onChange={(e) => {
                              handleArrayItemChange("members", index, "role", e.target.value)
                            }}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`member-${index}-image`}>Image URL</Label>
                          <Input
                            id={`member-${index}-image`}
                            value={member.image || ""}
                            onChange={(e) => {
                              handleArrayItemChange("members", index, "image", e.target.value)
                            }}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`member-${index}-bio`}>Bio</Label>
                          <Textarea
                            id={`member-${index}-bio`}
                            value={member.bio || ""}
                            onChange={(e) => {
                              handleArrayItemChange("members", index, "bio", e.target.value)
                            }}
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="layout">Layout</Label>
              <Select
                value={properties.layout || "grid"}
                onValueChange={(value) => handlePropertyChange("layout", value)}
              >
                <SelectTrigger id="layout">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="columns">Columns (Grid Layout)</Label>
              <Select
                value={properties.columns?.toString() || "3"}
                onValueChange={(value) => handlePropertyChange("columns", Number.parseInt(value))}
              >
                <SelectTrigger id="columns">
                  <SelectValue placeholder="Select columns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-4 text-center">
            <p>Basic property editor for {componentType}</p>
            <div className="mt-4 space-y-4">
              {Object.entries(properties).map(([key, value]) => {
                // Skip complex objects and arrays for the basic editor
                if (typeof value === "object") return null

                return (
                  <div key={key}>
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    {typeof value === "string" ? (
                      <Input id={key} value={value} onChange={(e) => handlePropertyChange(key, e.target.value)} />
                    ) : typeof value === "boolean" ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => handlePropertyChange(key, checked)}
                        />
                        <Label htmlFor={key}>Enabled</Label>
                      </div>
                    ) : typeof value === "number" ? (
                      <Input
                        id={key}
                        type="number"
                        value={value}
                        onChange={(e) => handlePropertyChange(key, Number(e.target.value))}
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h3 className="text-lg font-medium">Edit {getComponentDisplayName(componentType)}</h3>
        </div>
        {componentId && (
          <Button variant="destructive" size="sm" onClick={() => onRemoveComponent(componentId)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <div className="border-t pt-4">{renderPropertyEditor()}</div>
    </div>
  )
})
