"use client"

import { memo } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ComponentRenderer } from "./component-renderer"

interface LivePreviewProps {
  page: string
  viewportSize?: "desktop" | "tablet" | "mobile"
  editMode?: boolean
  onSelectComponent?: (componentId: string | null) => void
  selectedComponentId?: string | null
  onDragEnd?: (event: any) => void
  components?: any[] // Make components optional
}

// Sortable component wrapper
const SortableComponent = memo(function SortableComponent({ component, isSelected, onClick, editMode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: component.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ComponentRenderer
        key={component.id}
        component={component}
        isSelected={isSelected}
        onClick={onClick}
        editMode={editMode}
      />
    </div>
  )
})

export const LivePreview = memo(function LivePreview({
  page,
  viewportSize = "desktop",
  editMode = false,
  onSelectComponent,
  selectedComponentId,
  onDragEnd,
  components = [], // Provide default empty array
}: LivePreviewProps) {
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  )

  // Handle component selection
  const handleComponentClick = (componentId: string) => {
    if (editMode && onSelectComponent) {
      onSelectComponent(componentId)
    }
  }

  // Determine viewport class
  const viewportClass = {
    desktop: "w-full",
    tablet: "max-w-[768px] mx-auto",
    mobile: "max-w-[375px] mx-auto",
  }[viewportSize]

  // If there are no components, show a placeholder
  if (!components || components.length === 0) {
    return (
      <div className={`${viewportClass} bg-white rounded-md shadow-sm min-h-[200px] flex items-center justify-center`}>
        <div className="text-center p-8">
          <h3 className="text-lg font-medium mb-2">This page is empty</h3>
          <p className="text-muted-foreground">
            {editMode
              ? "Add components from the library to build your page."
              : "There's nothing to display on this page yet."}
          </p>
        </div>
      </div>
    )
  }

  // If not in edit mode, render the components without DnD
  if (!editMode) {
    return (
      <div className={`${viewportClass} bg-white rounded-md shadow-sm`}>
        {components.map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            isSelected={false}
            onClick={() => {}}
            editMode={false}
          />
        ))}
      </div>
    )
  }

  // In edit mode, render with DnD
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <div className={`${viewportClass} bg-white rounded-md shadow-sm`}>
        <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {components.map((component) => (
            <SortableComponent
              key={component.id}
              component={component}
              isSelected={component.id === selectedComponentId}
              onClick={() => handleComponentClick(component.id)}
              editMode={true}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  )
})
