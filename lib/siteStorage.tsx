"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { shallow } from "zustand/shallow"

// Define the shape of a component
interface SiteComponent {
  id: string
  type: string
  properties: Record<string, any>
}

// Define the shape of page data
interface PageData {
  components: SiteComponent[]
}

// Define the shape of website data
interface WebsiteData {
  [page: string]: PageData
}

// Define the shape of a page in navigation
interface Page {
  id: string
  title: string
  slug: string
  description?: string
  isHomePage?: boolean
  order: number
}

// Define the shape of website navigation
interface WebsiteNavigation {
  pages: Page[]
}

// Define the shape of website metadata
interface WebsiteMetadata {
  lastUpdated: number
  version: number
  activePage: string
  activeComponentId: string | null
}

// Define the store state
interface WebsiteStore {
  websiteData: WebsiteData
  navigation: WebsiteNavigation
  metadata: WebsiteMetadata
  setWebsiteData: (data: WebsiteData) => void
  setNavigation: (navigation: WebsiteNavigation) => void
  setActivePage: (pageId: string) => void
  setActiveComponent: (componentId: string | null) => void
  incrementVersion: () => void
  addComponent: (page: string, component: SiteComponent) => void
  removeComponent: (page: string, componentId: string) => void
  updateComponentProperties: (page: string, componentId: string, properties: Record<string, any>) => void
  moveComponent: (page: string, fromIndex: number, toIndex: number) => void
  addPage: (page: Page) => void
  updatePage: (pageId: string, pageData: Partial<Page>) => void
  removePage: (pageId: string) => void
  reorderPages: (pageIds: string[]) => void
  hasLocalBackup: () => boolean
  restoreFromLocalBackup: () => void
  clearLocalBackup: () => void
}

// Create the store
const useWebsiteStore = create<WebsiteStore>()(
  persist(
    (set, get) => ({
      websiteData: {},
      navigation: { pages: [] },
      metadata: {
        lastUpdated: Date.now(),
        version: 1,
        activePage: "home",
        activeComponentId: null,
      },

      setWebsiteData: (data) =>
        set((state) => ({
          websiteData: data,
          metadata: {
            ...state.metadata,
            lastUpdated: Date.now(),
            version: state.metadata.version + 1,
          },
        })),

      setNavigation: (navigation) =>
        set((state) => ({
          navigation,
          metadata: {
            ...state.metadata,
            lastUpdated: Date.now(),
            version: state.metadata.version + 1,
          },
        })),

      setActivePage: (pageId) =>
        set((state) => ({
          metadata: {
            ...state.metadata,
            activePage: pageId,
            activeComponentId: null,
          },
        })),

      setActiveComponent: (componentId) =>
        set((state) => ({
          metadata: {
            ...state.metadata,
            activeComponentId: componentId,
          },
        })),

      incrementVersion: () =>
        set((state) => ({
          metadata: {
            ...state.metadata,
            lastUpdated: Date.now(),
            version: state.metadata.version + 1,
          },
        })),

      addComponent: (page, component) =>
        set((state) => {
          // Create a deep copy of the current state
          const newData = { ...state.websiteData }

          // Ensure the page exists
          if (!newData[page]) {
            newData[page] = { components: [] }
          }

          // Add the component to the page
          newData[page].components = [...newData[page].components, component]

          return {
            websiteData: newData,
            metadata: {
              ...state.metadata,
              lastUpdated: Date.now(),
              version: state.metadata.version + 1,
              activeComponentId: component.id,
            },
          }
        }),

      removeComponent: (page, componentId) =>
        set((state) => {
          // Create a deep copy of the current state
          const newData = { ...state.websiteData }

          // Ensure the page exists
          if (!newData[page]) {
            return state
          }

          // Remove the component from the page
          newData[page].components = newData[page].components.filter((component) => component.id !== componentId)

          return {
            websiteData: newData,
            metadata: {
              ...state.metadata,
              lastUpdated: Date.now(),
              version: state.metadata.version + 1,
              activeComponentId: null,
            },
          }
        }),

      updateComponentProperties: (page, componentId, properties) =>
        set((state) => {
          // Create a deep copy of the current state
          const newData = { ...state.websiteData }

          // Ensure the page exists
          if (!newData[page]) {
            return state
          }

          // Find the component
          const componentIndex = newData[page].components.findIndex((component) => component.id === componentId)

          if (componentIndex === -1) {
            return state
          }

          // Update the component properties
          newData[page].components[componentIndex] = {
            ...newData[page].components[componentIndex],
            properties,
          }

          return {
            websiteData: newData,
            metadata: {
              ...state.metadata,
              lastUpdated: Date.now(),
              version: state.metadata.version + 1,
            },
          }
        }),

      moveComponent: (page, fromIndex, toIndex) =>
        set((state) => {
          // Create a deep copy of the current state
          const newData = { ...state.websiteData }

          // Ensure the page exists
          if (!newData[page]) {
            return state
          }

          // Move the component
          const components = [...newData[page].components]
          const [movedComponent] = components.splice(fromIndex, 1)
          components.splice(toIndex, 0, movedComponent)

          newData[page].components = components

          return {
            websiteData: newData,
            metadata: {
              ...state.metadata,
              lastUpdated: Date.now(),
              version: state.metadata.version + 1,
            },
          }
        }),

      addPage: (page) =>
        set((state) => {
          // Create a deep copy of the current state
          const newNavigation = { ...state.navigation }
          const newData = { ...state.websiteData }

          // Add the page to navigation
          newNavigation.pages = [...newNavigation.pages, page]

          // Initialize the page in websiteData if it doesn't exist
          if (!newData[page.id]) {
            newData[page.id] = { components: [] }
          }

          return {
            navigation: newNavigation,
            websiteData: newData,
            metadata: {
              ...state.metadata,
              lastUpdated: Date.now(),
              version: state.metadata.version + 1,
            },
          }
        }),

      updatePage: (pageId, pageData) =>
        set((state) => {
          // Create a deep copy of the current state
          const newNavigation = { ...state.navigation }
          const newData = { ...state.websiteData }

          // Find the page in navigation
          const pageIndex = newNavigation.pages.findIndex((page) => page.id === pageId)

          if (pageIndex === -1) {
            return state
          }

          // Update the page in navigation
          newNavigation.pages[pageIndex] = {
            ...newNavigation.pages[pageIndex],
            ...pageData,
          }

          // If the page ID changed, update websiteData
          if (pageData.id && pageData.id !== pageId) {
            newData[pageData.id] = newData[pageId]
            delete newData[pageId]
          }

          return {
            navigation: newNavigation,
            websiteData: newData,
            metadata: {
              ...state.metadata,
              lastUpdated: Date.now(),
              version: state.metadata.version + 1,
            },
          }
        }),

      removePage: (pageId) =>
        set((state) => {
          // Create a deep copy of the current state
          const newNavigation = { ...state.navigation }
          const newData = { ...state.websiteData }

          // Remove the page from navigation
          newNavigation.pages = newNavigation.pages.filter((page) => page.id !== pageId)

          // Remove the page from websiteData
          delete newData[pageId]

          return {
            navigation: newNavigation,
            websiteData: newData,
            metadata: {
              ...state.metadata,
              lastUpdated: Date.now(),
              version: state.metadata.version + 1,
              activePage: newNavigation.pages[0]?.id || "home",
            },
          }
        }),

      reorderPages: (pageIds) =>
        set((state) => {
          // Create a deep copy of the current state
          const newNavigation = { ...state.navigation }

          // Reorder pages based on the provided IDs
          const reorderedPages = pageIds
            .map((id, index) => {
              const page = newNavigation.pages.find((p) => p.id === id)
              if (!page) return null

              return {
                ...page,
                order: index,
              }
            })
            .filter(Boolean) as Page[]

          newNavigation.pages = reorderedPages

          return {
            navigation: newNavigation,
            metadata: {
              ...state.metadata,
              lastUpdated: Date.now(),
              version: state.metadata.version + 1,
            },
          }
        }),

      hasLocalBackup: () => {
        // Check if there's a backup in localStorage
        const storedValue = localStorage.getItem("website-store")
        return !!storedValue
      },

      restoreFromLocalBackup: () => {
        // Restore from localStorage backup
        const storedValue = localStorage.getItem("website-store")
        if (storedValue) {
          try {
            const parsedValue = JSON.parse(storedValue)
            set({
              websiteData: parsedValue.state.websiteData || {},
              navigation: parsedValue.state.navigation || { pages: [] },
              metadata: {
                ...(parsedValue.state.metadata || {
                  lastUpdated: Date.now(),
                  version: 1,
                  activePage: "home",
                  activeComponentId: null,
                }),
                lastUpdated: Date.now(),
              },
            })
          } catch (error) {
            console.error("Failed to restore from backup:", error)
          }
        }
      },

      clearLocalBackup: () => {
        // Clear the localStorage backup
        localStorage.removeItem("website-store")
      },
    }),
    {
      name: "website-store",
      // Persist both websiteData and navigation
      partialize: (state) => ({
        websiteData: state.websiteData,
        navigation: state.navigation,
        metadata: state.metadata,
      }),
    },
  ),
)

// Cache for selector results to prevent getSnapshot warnings
const selectorCache = new Map()

// Custom hook for subscribing to website data changes with caching
function useWebsiteData() {
  const cacheKey = "websiteData"

  // Create a selector function that returns a new object with only the needed properties
  const selector = (state) => ({
    websiteData: state.websiteData,
    navigation: state.navigation,
    metadata: state.metadata,
    version: state.metadata.version,
    lastUpdated: state.metadata.lastUpdated,
    activePage: state.metadata.activePage,
    activeComponentId: state.metadata.activeComponentId,
  })

  // Use the cached selector if available
  if (!selectorCache.has(cacheKey)) {
    selectorCache.set(cacheKey, selector)
  }

  // Use the cached selector with shallow comparison
  return useWebsiteStore(selectorCache.get(cacheKey), shallow)
}

// Custom hook for subscribing to a specific page's data with caching
function usePageData(pageId: string) {
  const cacheKey = `pageData-${pageId}`

  // Create a selector function that returns a new object with only the needed properties
  const selector = (state) => {
    // Get the page data or return a default empty object
    const pageData = state.websiteData[pageId] || { components: [] }

    // Return a stable object with only the needed properties
    return {
      pageData,
      version: state.metadata.version,
      lastUpdated: state.metadata.lastUpdated,
    }
  }

  // Use the cached selector if available
  if (!selectorCache.has(cacheKey)) {
    selectorCache.set(cacheKey, selector)
  }

  // Use the cached selector with shallow comparison
  return useWebsiteStore(selectorCache.get(cacheKey), shallow)
}

// Custom hook for subscribing to active page components with caching
function useActivePageComponents() {
  const cacheKey = "activePageComponents"

  // Create a selector function that returns the components for the active page
  const selector = (state) => {
    const activePage = state.metadata.activePage
    if (!activePage || !state.websiteData[activePage]) {
      return []
    }
    return state.websiteData[activePage].components || []
  }

  // Use the cached selector if available
  if (!selectorCache.has(cacheKey)) {
    selectorCache.set(cacheKey, selector)
  }

  // Use the cached selector with shallow comparison
  return useWebsiteStore(selectorCache.get(cacheKey), shallow)
}

// Custom hook for subscribing to metadata with caching
function useWebsiteMetadata() {
  const cacheKey = "metadata"

  // Create a selector function that returns the metadata
  const selector = (state) => state.metadata

  // Use the cached selector if available
  if (!selectorCache.has(cacheKey)) {
    selectorCache.set(cacheKey, selector)
  }

  // Use the cached selector with shallow comparison
  return useWebsiteStore(selectorCache.get(cacheKey), shallow)
}

// Add a utility function to create stable selectors with caching
function createCachedSelector(selectorKey: string, selectorFn: (state: any) => any) {
  if (!selectorCache.has(selectorKey)) {
    selectorCache.set(selectorKey, selectorFn)
  }
  return selectorCache.get(selectorKey)
}

export {
  useWebsiteStore,
  useWebsiteData,
  usePageData,
  useActivePageComponents,
  useWebsiteMetadata,
  createCachedSelector,
}
