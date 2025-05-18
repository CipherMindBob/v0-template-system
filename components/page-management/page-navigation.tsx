"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWebsiteStore } from "@/lib/siteStorage"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PageNavigationProps {
  currentPageId: string
  onPageSelect: (pageId: string) => void
}

export function PageNavigation({ currentPageId, onPageSelect }: PageNavigationProps) {
  const { navigation } = useWebsiteStore()
  const [isOpen, setIsOpen] = useState(false)

  // Sort pages by order
  const sortedPages = [...navigation.pages].sort((a, b) => a.order - b.order)

  // Find current page
  const currentPage = navigation.pages.find((page) => page.id === currentPageId)

  return (
    <div className="flex items-center space-x-2">
      <div className="hidden md:flex items-center space-x-4">
        {sortedPages.map((page) => (
          <Button
            key={page.id}
            variant={page.id === currentPageId ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageSelect(page.id)}
          >
            {page.title}
          </Button>
        ))}
      </div>

      <div className="md:hidden">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-[130px] justify-between">
              {currentPage?.title || "Select Page"}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[130px]">
            {sortedPages.map((page) => (
              <DropdownMenuItem
                key={page.id}
                onClick={() => {
                  onPageSelect(page.id)
                  setIsOpen(false)
                }}
              >
                {page.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
