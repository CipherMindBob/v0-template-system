"use client"

import { useState, useCallback, memo } from "react"
import { useWebsiteStore } from "@/lib/siteStorage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { Plus, MoreHorizontal, FileText, Trash, Edit, Copy } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"

// Define the page interface
interface Page {
  id: string
  title: string
  slug: string
  description?: string
  isHomePage?: boolean
  order: number
}

// Use primitive selectors
const websiteDataSelector = (state) => state.websiteData
const navigationSelector = (state) => state.navigation
const actionsSelector = (state) => ({
  setWebsiteData: state.setWebsiteData,
  setNavigation: state.setNavigation,
  addPage: state.addPage,
  updatePage: state.updatePage,
  removePage: state.removePage,
  reorderPages: state.reorderPages,
})

interface PageManagerProps {
  siteId: string
  onPageSelect: (pageId: string) => void
  selectedPageId?: string | null
}

export const PageManager = memo(function PageManager({ siteId, onPageSelect, selectedPageId }: PageManagerProps) {
  // Get data from store using primitive selectors
  const websiteData = useWebsiteStore(websiteDataSelector)
  const navigation = useWebsiteStore(navigationSelector)
  const actions = useWebsiteStore(actionsSelector)

  // Local state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newPageData, setNewPageData] = useState({ title: "", slug: "", description: "" })
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Handle page creation
  const handleCreatePage = useCallback(() => {
    setIsLoading(true)

    try {
      // Validate inputs
      if (!newPageData.title.trim()) {
        toast({
          title: "Error",
          description: "Page title is required",
          variant: "destructive",
        })
        return
      }

      // Generate slug if not provided
      const slug = newPageData.slug.trim() || newPageData.title.toLowerCase().replace(/\s+/g, "-")

      // Check if slug already exists
      if (navigation.pages.some((page) => page.slug === slug)) {
        toast({
          title: "Error",
          description: "A page with this URL already exists",
          variant: "destructive",
        })
        return
      }

      // Create new page
      const newPage: Page = {
        id: slug,
        title: newPageData.title,
        slug,
        description: newPageData.description,
        order: navigation.pages.length,
      }

      // Update navigation
      const updatedPages = [...navigation.pages, newPage]
      actions.setNavigation({ pages: updatedPages })

      // Update websiteData with empty page
      const updatedWebsiteData = { ...websiteData }
      updatedWebsiteData[slug] = { components: [] }
      actions.setWebsiteData(updatedWebsiteData)

      // Reset form and close dialog
      setNewPageData({ title: "", slug: "", description: "" })
      setIsCreateDialogOpen(false)

      // Select the new page
      onPageSelect(slug)

      toast({
        title: "Success",
        description: `Page "${newPageData.title}" created successfully`,
      })
    } catch (error) {
      console.error("Error creating page:", error)
      toast({
        title: "Error",
        description: "Failed to create page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [newPageData, navigation.pages, actions, websiteData, onPageSelect])

  // Handle page deletion
  const handleDeletePage = useCallback(() => {
    if (!editingPage) return

    setIsLoading(true)

    try {
      // Prevent deleting home page
      if (editingPage.isHomePage) {
        toast({
          title: "Error",
          description: "You cannot delete the home page",
          variant: "destructive",
        })
        return
      }

      // Remove page from navigation
      const updatedPages = navigation.pages.filter((page) => page.id !== editingPage.id)
      actions.setNavigation({ pages: updatedPages })

      // Remove page from websiteData
      const updatedWebsiteData = { ...websiteData }
      delete updatedWebsiteData[editingPage.id]
      actions.setWebsiteData(updatedWebsiteData)

      // If the deleted page was selected, select the home page
      if (selectedPageId === editingPage.id) {
        onPageSelect("home")
      }

      // Reset and close dialog
      setEditingPage(null)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Success",
        description: `Page "${editingPage.title}" deleted successfully`,
      })
    } catch (error) {
      console.error("Error deleting page:", error)
      toast({
        title: "Error",
        description: "Failed to delete page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [editingPage, navigation.pages, actions, websiteData, selectedPageId, onPageSelect])

  // Handle page rename
  const handleRenamePage = useCallback(() => {
    if (!editingPage) return

    setIsLoading(true)

    try {
      // Validate inputs
      if (!newPageData.title.trim()) {
        toast({
          title: "Error",
          description: "Page title is required",
          variant: "destructive",
        })
        return
      }

      // Generate new slug if provided
      const newSlug = newPageData.slug.trim() || editingPage.slug

      // Check if new slug already exists (except for the current page)
      if (newSlug !== editingPage.slug && navigation.pages.some((page) => page.slug === newSlug)) {
        toast({
          title: "Error",
          description: "A page with this URL already exists",
          variant: "destructive",
        })
        return
      }

      // Update navigation
      const updatedPages = navigation.pages.map((page) => {
        if (page.id === editingPage.id) {
          return {
            ...page,
            title: newPageData.title,
            slug: newSlug,
            description: newPageData.description,
          }
        }
        return page
      })

      actions.setNavigation({ pages: updatedPages })

      // If slug changed, update websiteData
      if (newSlug !== editingPage.slug) {
        const updatedWebsiteData = { ...websiteData }
        updatedWebsiteData[newSlug] = updatedWebsiteData[editingPage.id]
        delete updatedWebsiteData[editingPage.id]
        actions.setWebsiteData(updatedWebsiteData)

        // Update selected page if needed
        if (selectedPageId === editingPage.id) {
          onPageSelect(newSlug)
        }
      }

      // Reset and close dialog
      setEditingPage(null)
      setNewPageData({ title: "", slug: "", description: "" })
      setIsRenameDialogOpen(false)

      toast({
        title: "Success",
        description: `Page "${editingPage.title}" updated successfully`,
      })
    } catch (error) {
      console.error("Error renaming page:", error)
      toast({
        title: "Error",
        description: "Failed to update page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [editingPage, newPageData, navigation.pages, actions, websiteData, selectedPageId, onPageSelect])

  // Handle page duplication
  const handleDuplicatePage = useCallback(
    (page: Page) => {
      try {
        // Generate unique slug
        const timestamp = Date.now()
        const randomId = Math.floor(Math.random() * 1000)
        const newSlug = `${page.slug}-copy-${timestamp}`

        // Create new page
        const newPage: Page = {
          id: newSlug,
          title: `${page.title} (Copy)`,
          slug: newSlug,
          description: page.description,
          order: navigation.pages.length,
        }

        // Update navigation
        const updatedPages = [...navigation.pages, newPage]
        actions.setNavigation({ pages: updatedPages })

        // Duplicate page content in websiteData
        const updatedWebsiteData = { ...websiteData }
        updatedWebsiteData[newSlug] = JSON.parse(JSON.stringify(websiteData[page.id]))
        actions.setWebsiteData(updatedWebsiteData)

        toast({
          title: "Success",
          description: `Page "${page.title}" duplicated successfully`,
        })

        // Select the new page
        onPageSelect(newSlug)
      } catch (error) {
        console.error("Error duplicating page:", error)
        toast({
          title: "Error",
          description: "Failed to duplicate page. Please try again.",
          variant: "destructive",
        })
      }
    },
    [navigation.pages, actions, websiteData, onPageSelect],
  )

  // Handle page reordering
  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event

      if (active.id !== over.id) {
        const oldIndex = navigation.pages.findIndex((page) => page.id === active.id)
        const newIndex = navigation.pages.findIndex((page) => page.id === over.id)

        // Reorder pages
        const updatedPages = [...navigation.pages]
        const [movedPage] = updatedPages.splice(oldIndex, 1)
        updatedPages.splice(newIndex, 0, movedPage)

        // Update order property
        const reorderedPages = updatedPages.map((page, index) => ({
          ...page,
          order: index,
        }))

        actions.setNavigation({ pages: reorderedPages })

        toast({
          title: "Success",
          description: "Page order updated successfully",
        })
      }
    },
    [navigation.pages, actions],
  )

  // Sortable page item component
  const SortablePageItem = memo(function SortablePageItem({ page }: { page: Page }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 999 : "auto",
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center justify-between p-3 rounded-md mb-2 cursor-pointer ${
          selectedPageId === page.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
        }`}
        onClick={() => onPageSelect(page.id)}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          <div>
            <div className="font-medium">{page.title}</div>
            <div className="text-xs opacity-70">{page.slug}</div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Page Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setEditingPage(page)
                setNewPageData({
                  title: page.title,
                  slug: page.slug,
                  description: page.description || "",
                })
                setIsRenameDialogOpen(true)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleDuplicatePage(page)
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setEditingPage(page)
                setIsDeleteDialogOpen(true)
              }}
              disabled={page.isHomePage}
              className={page.isHomePage ? "text-muted-foreground" : "text-destructive"}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Pages</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>
                Add a new page to your website. The page will be created with a blank layout.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={newPageData.title}
                  onChange={(e) => setNewPageData({ ...newPageData, title: e.target.value })}
                  placeholder="About Us"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">
                  Page URL <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="slug"
                  value={newPageData.slug}
                  onChange={(e) =>
                    setNewPageData({ ...newPageData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                  }
                  placeholder="about-us"
                />
                <p className="text-xs text-muted-foreground">Leave blank to generate automatically from title</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">
                  Description <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  value={newPageData.description}
                  onChange={(e) => setNewPageData({ ...newPageData, description: e.target.value })}
                  placeholder="Page description for internal reference"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePage} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Page"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <ScrollArea className="h-[400px] pr-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={navigation.pages.map((page) => page.id)} strategy={verticalListSortingStrategy}>
                {navigation.pages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pages found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click the "Add Page" button to create your first page
                    </p>
                  </div>
                ) : (
                  navigation.pages.map((page) => <SortablePageItem key={page.id} page={page} />)
                )}
              </SortableContext>
            </DndContext>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Rename Page Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
            <DialogDescription>Update the title and settings for this page.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Page Title</Label>
              <Input
                id="edit-title"
                value={newPageData.title}
                onChange={(e) => setNewPageData({ ...newPageData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">
                Page URL <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="edit-slug"
                value={newPageData.slug}
                onChange={(e) =>
                  setNewPageData({ ...newPageData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                }
                disabled={editingPage?.isHomePage}
              />
              {editingPage?.isHomePage && (
                <p className="text-xs text-muted-foreground">The home page URL cannot be changed</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">
                Description <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="edit-description"
                value={newPageData.description}
                onChange={(e) => setNewPageData({ ...newPageData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenamePage} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Page Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the page "{editingPage?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePage} className="bg-destructive text-destructive-foreground">
              {isLoading ? "Deleting..." : "Delete Page"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
})
