"use client"

import { memo } from "react"
import { HeroSection } from "@/components/site-pages/templates/hero-section"
import { Header } from "@/components/site-pages/templates/header"
import { FeatureSection } from "@/components/site-pages/templates/feature-section"
import { TeamShowcase } from "@/components/site-pages/templates/team-showcase"
import { ServicesList } from "@/components/site-pages/templates/services-list"
import { ContentBlock } from "@/components/site-pages/templates/content-block"
import { SlideViewer } from "@/components/site-pages/templates/slide-viewer"
import { VideoPlayer } from "@/components/site-pages/templates/video-player"
import { EnhancedVideoPlayer } from "@/components/site-pages/templates/enhanced-video-player"
import { Calendar } from "@/components/site-pages/templates/calendar"
import { EnhancedCalendar } from "@/components/site-pages/templates/enhanced-calendar"
import { EmailForm } from "@/components/site-pages/templates/email-form"
import { EmailComponent } from "@/components/site-pages/templates/email-component"
import { ChatInterface } from "@/components/site-pages/templates/chat-interface"
import { EnhancedChatInterface } from "@/components/site-pages/templates/enhanced-chat-interface"
import { CallToAction } from "@/components/site-pages/templates/call-to-action"
import { PricingTable } from "@/components/site-pages/templates/pricing-table"
import { CallComponent } from "@/components/site-pages/templates/call-component"

interface ComponentRendererProps {
  component: {
    id: string
    type: string
    properties: Record<string, any>
  }
  isSelected?: boolean
  onClick?: () => void
  editMode?: boolean
}

export const ComponentRenderer = memo(function ComponentRenderer({
  component,
  isSelected = false,
  onClick = () => {},
  editMode = false,
}: ComponentRendererProps) {
  const { type, properties } = component

  // Add selection styling if in edit mode and selected
  const wrapperClasses = isSelected
    ? "relative outline outline-2 outline-primary outline-offset-2"
    : editMode
      ? "relative hover:outline hover:outline-1 hover:outline-primary/50 hover:outline-offset-2"
      : ""

  // Render the appropriate component based on type
  const renderComponent = () => {
    switch (type) {
      case "hero-section":
        return <HeroSection {...properties} editMode={editMode} />

      case "header":
        return <Header {...properties} editMode={editMode} />

      case "feature-section":
        return <FeatureSection {...properties} editMode={editMode} />

      case "team-showcase":
        return <TeamShowcase {...properties} editMode={editMode} />

      case "servicesList":
        return <ServicesList {...properties} editMode={editMode} />

      case "content":
        return <ContentBlock {...properties} editMode={editMode} />

      case "slide-viewer":
        return <SlideViewer {...properties} editMode={editMode} />

      case "video-player":
        return <VideoPlayer {...properties} editMode={editMode} />

      case "enhanced-video-player":
        return <EnhancedVideoPlayer {...properties} editMode={editMode} />

      case "calendar":
        return <Calendar {...properties} editMode={editMode} />

      case "enhanced-calendar":
        return <EnhancedCalendar {...properties} editMode={editMode} />

      case "email-form":
        return <EmailForm {...properties} editMode={editMode} />

      case "email-component":
        return <EmailComponent {...properties} editMode={editMode} />

      case "chat-interface":
        return <ChatInterface {...properties} editMode={editMode} />

      case "enhanced-chat-interface":
        return <EnhancedChatInterface {...properties} editMode={editMode} />

      case "call-to-action":
        return <CallToAction {...properties} editMode={editMode} />

      case "pricing-table":
        return <PricingTable {...properties} editMode={editMode} />

      case "call-component":
        return <CallComponent {...properties} editMode={editMode} />

      default:
        // Log the error for debugging purposes
        console.warn(`Unknown component type encountered: ${type}`, component)

        return (
          <div className="p-4 border-2 border-dashed border-red-300 rounded-lg bg-red-50 relative">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl">Error</div>
            <div className="flex flex-col items-center justify-center space-y-3 py-6 px-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-500"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 className="text-red-800 font-medium text-lg">Unknown Component Type</h3>
              <p className="text-red-600 text-center max-w-md">
                The component type <code className="bg-red-100 px-1 py-0.5 rounded font-mono">{type}</code> is not
                registered in the component renderer.
              </p>
              <div className="mt-2 w-full text-sm text-red-600 bg-red-100 p-3 rounded">
                <p className="font-semibold mb-1">Available component types:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 font-mono text-xs">
                  <div>hero-section</div>
                  <div>header</div>
                  <div>feature-section</div>
                  <div>team-showcase</div>
                  <div>servicesList</div>
                  <div>content</div>
                  <div>slide-viewer</div>
                  <div>video-player</div>
                  <div>enhanced-video-player</div>
                  <div>calendar</div>
                  <div>enhanced-calendar</div>
                  <div>email-form</div>
                  <div>email-component</div>
                  <div>chat-interface</div>
                  <div>enhanced-chat-interface</div>
                  <div>call-to-action</div>
                  <div>pricing-table</div>
                  <div>call-component</div>
                </div>
              </div>
              <div className="mt-2 w-full text-sm">
                <p className="text-red-600 font-medium">To resolve this issue:</p>
                <ol className="list-decimal list-inside text-red-600 mt-1">
                  <li>Check the component type and ensure it is correctly spelled.</li>
                  <li>Verify that the component is imported at the top of the file.</li>
                  <li>Contact support if the issue persists.</li>
                </ol>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={wrapperClasses} onClick={onClick}>
      {renderComponent()}
    </div>
  )
})
