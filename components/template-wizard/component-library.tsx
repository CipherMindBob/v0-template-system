"use client"

import type React from "react"

import { useState, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Layout,
  Type,
  ImageIcon,
  FileText,
  Users,
  Mail,
  MapPin,
  Calendar,
  Video,
  MessageSquare,
  Phone,
  CreditCard,
} from "lucide-react"

interface ComponentLibraryProps {
  onAddComponent: (componentType: string) => void
}

export const ComponentLibrary = memo(function ComponentLibrary({ onAddComponent }: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  const handleAddComponent = useCallback(
    (componentType: string) => {
      if (onAddComponent) {
        onAddComponent(componentType)
      }
    },
    [onAddComponent],
  )

  const filteredComponents = useCallback(
    (category: string) => {
      const components = getComponentsByCategory(category)
      if (!searchQuery) return components

      const query = searchQuery.toLowerCase()
      return components.filter(
        (component) =>
          component.title.toLowerCase().includes(query) || component.description.toLowerCase().includes(query),
      )
    },
    [searchQuery],
  )

  return (
    <div className="h-full flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search components..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="interactive">Interactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="h-[calc(100%-80px)]">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {filteredComponents("all").map((component) => (
                <ComponentCard
                  key={component.type}
                  title={component.title}
                  description={component.description}
                  icon={component.icon}
                  onClick={() => handleAddComponent(component.type)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layout" className="h-[calc(100%-80px)]">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {filteredComponents("layout").map((component) => (
                <ComponentCard
                  key={component.type}
                  title={component.title}
                  description={component.description}
                  icon={component.icon}
                  onClick={() => handleAddComponent(component.type)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="content" className="h-[calc(100%-80px)]">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {filteredComponents("content").map((component) => (
                <ComponentCard
                  key={component.type}
                  title={component.title}
                  description={component.description}
                  icon={component.icon}
                  onClick={() => handleAddComponent(component.type)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="interactive" className="h-[calc(100%-80px)]">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {filteredComponents("interactive").map((component) => (
                <ComponentCard
                  key={component.type}
                  title={component.title}
                  description={component.description}
                  icon={component.icon}
                  onClick={() => handleAddComponent(component.type)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
})

interface ComponentCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

const ComponentCard = memo(function ComponentCard({ title, description, icon, onClick }: ComponentCardProps) {
  return (
    <Card className="cursor-pointer hover:bg-accent/50" onClick={onClick}>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="pt-1.5">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
})

function getComponentsByCategory(category: string) {
  const allComponents = [
    {
      type: "hero-section",
      title: "Hero Section",
      description: "A large banner with title, subtitle and call-to-action",
      icon: <Layout className="h-4 w-4" />,
      category: "layout",
    },
    {
      type: "header",
      title: "Section Header",
      description: "A header with title and subtitle",
      icon: <Type className="h-4 w-4" />,
      category: "layout",
    },
    {
      type: "feature-section",
      title: "Feature Section",
      description: "Showcase a feature with image and text",
      icon: <ImageIcon className="h-4 w-4" />,
      category: "content",
    },
    {
      type: "content",
      title: "Content Block",
      description: "A block of rich text content",
      icon: <FileText className="h-4 w-4" />,
      category: "content",
    },
    {
      type: "team-showcase",
      title: "Team Showcase",
      description: "Display team members with photos and bios",
      icon: <Users className="h-4 w-4" />,
      category: "content",
    },
    {
      type: "servicesList",
      title: "Services List",
      description: "List your services with icons and descriptions",
      icon: <FileText className="h-4 w-4" />,
      category: "content",
    },
    {
      type: "email-form",
      title: "Contact Form",
      description: "A form for visitors to contact you",
      icon: <Mail className="h-4 w-4" />,
      category: "interactive",
    },
    {
      type: "call-to-action",
      title: "Call to Action",
      description: "Prompt visitors to take an action",
      icon: <MapPin className="h-4 w-4" />,
      category: "content",
    },
    {
      type: "calendar",
      title: "Calendar",
      description: "Display events on a calendar",
      icon: <Calendar className="h-4 w-4" />,
      category: "interactive",
    },
    {
      type: "video-player",
      title: "Video Player",
      description: "Embed and play videos",
      icon: <Video className="h-4 w-4" />,
      category: "interactive",
    },
    {
      type: "chat-interface",
      title: "Chat Interface",
      description: "Interactive chat interface for support",
      icon: <MessageSquare className="h-4 w-4" />,
      category: "interactive",
    },
    {
      type: "call-component",
      title: "Call Component",
      description: "Interface for making calls",
      icon: <Phone className="h-4 w-4" />,
      category: "interactive",
    },
    {
      type: "pricing-table",
      title: "Pricing Table",
      description: "Display your pricing plans",
      icon: <CreditCard className="h-4 w-4" />,
      category: "content",
    },
  ]

  if (category === "all") {
    return allComponents
  }

  return allComponents.filter((component) => component.category === category)
}
