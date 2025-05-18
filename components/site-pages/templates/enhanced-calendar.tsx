"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, MapPin, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  parseISO,
  isToday,
  formatISO,
} from "date-fns"

interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  description?: string
  location?: string
  color?: string
  allDay?: boolean
}

interface EnhancedCalendarProps {
  title?: string
  events?: CalendarEvent[]
  viewType?: "month" | "week" | "day"
  allowEditing?: boolean
  editMode?: boolean
  onEventsChange?: (events: CalendarEvent[]) => void
}

export function EnhancedCalendar({
  title = "Calendar",
  events: initialEvents = [],
  viewType: initialViewType = "month",
  allowEditing = true,
  editMode = false,
  onEventsChange,
}: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<"month" | "week" | "day">(initialViewType)
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    date: formatISO(new Date(), { representation: "date" }),
    startTime: "09:00",
    endTime: "10:00",
    description: "",
    location: "",
    color: "#3b82f6", // blue-500
    allDay: false,
  })
  const { toast } = useToast()

  // Update events when initialEvents changes
  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  // Notify parent component when events change
  useEffect(() => {
    if (onEventsChange) {
      onEventsChange(events)
    }
  }, [events, onEventsChange])

  // Get days for the current view
  const getDaysForView = () => {
    switch (viewType) {
      case "month": {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)

        const days = []
        let day = startDate
        while (day <= endDate) {
          days.push(day)
          day = addDays(day, 1)
        }
        return days
      }
      case "week": {
        const weekStart = startOfWeek(currentDate)
        const weekEnd = endOfWeek(currentDate)

        const days = []
        let day = weekStart
        while (day <= weekEnd) {
          days.push(day)
          day = addDays(day, 1)
        }
        return days
      }
      case "day": {
        return [currentDate]
      }
    }
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(parseISO(event.date), date))
  }

  // Navigate to previous period
  const navigatePrevious = () => {
    switch (viewType) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1))
        break
      case "week":
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case "day":
        setCurrentDate(subDays(currentDate, 1))
        break
    }
  }

  // Navigate to next period
  const navigateNext = () => {
    switch (viewType) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1))
        break
      case "week":
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case "day":
        setCurrentDate(addDays(currentDate, 1))
        break
    }
  }

  // Navigate to today
  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  // Handle adding a new event
  const handleAddEvent = () => {
    if (!newEvent.title) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your event.",
        variant: "destructive",
      })
      return
    }

    const eventId = `event-${Date.now()}`
    const event: CalendarEvent = {
      id: eventId,
      title: newEvent.title || "Untitled Event",
      date: newEvent.date || formatISO(new Date(), { representation: "date" }),
      startTime: newEvent.allDay ? undefined : newEvent.startTime,
      endTime: newEvent.allDay ? undefined : newEvent.endTime,
      description: newEvent.description,
      location: newEvent.location,
      color: newEvent.color,
      allDay: newEvent.allDay,
    }

    setEvents([...events, event])
    setIsAddEventOpen(false)

    // Reset new event form
    setNewEvent({
      title: "",
      date: formatISO(new Date(), { representation: "date" }),
      startTime: "09:00",
      endTime: "10:00",
      description: "",
      location: "",
      color: "#3b82f6",
      allDay: false,
    })

    toast({
      title: "Event added",
      description: "Your event has been added to the calendar.",
    })
  }

  // Handle deleting an event
  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId))
    setSelectedEvent(null)

    toast({
      title: "Event deleted",
      description: "Your event has been removed from the calendar.",
    })
  }

  // Render month view
  const renderMonthView = () => {
    const days = getDaysForView()

    return (
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-sm font-medium text-muted-foreground text-center py-2">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dayEvents = getEventsForDate(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isCurrentDay = isToday(day)

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] border rounded-md p-1 ${
                isCurrentMonth ? "bg-background" : "bg-muted/30"
              } ${isSelected ? "ring-2 ring-primary" : ""} ${isCurrentDay ? "border-primary" : ""}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-right">
                <span
                  className={`text-sm inline-block rounded-full w-7 h-7 leading-7 text-center ${
                    isCurrentDay ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded truncate cursor-pointer"
                    style={{ backgroundColor: event.color + "33" }} // Add transparency
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEvent(event)
                    }}
                  >
                    {event.allDay ? "All day: " : ""}
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render week view
  const renderWeekView = () => {
    const days = getDaysForView()
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 border-r"></div>
          {days.map((day) => (
            <div key={day.toISOString()} className={`p-2 text-center ${isToday(day) ? "bg-primary/10" : ""}`}>
              <div className="font-medium">{format(day, "EEE")}</div>
              <div
                className={`text-sm ${
                  isToday(day) ? "bg-primary text-primary-foreground rounded-full w-7 h-7 leading-7 mx-auto" : ""
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-y-auto max-h-[500px]">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
              <div className="p-1 text-xs text-muted-foreground border-r text-right pr-2">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </div>

              {days.map((day) => {
                const dayEvents = getEventsForDate(day).filter((event) => {
                  if (event.allDay) return false
                  if (!event.startTime) return false

                  const eventHour = Number.parseInt(event.startTime.split(":")[0])
                  return eventHour === hour
                })

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-1 relative ${isToday(day) ? "bg-primary/5" : ""}`}
                    onClick={() => {
                      setSelectedDate(day)
                      setNewEvent({
                        ...newEvent,
                        date: formatISO(day, { representation: "date" }),
                        startTime: `${hour.toString().padStart(2, "0")}:00`,
                        endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
                      })
                      if (allowEditing) {
                        setIsAddEventOpen(true)
                      }
                    }}
                  >
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded mb-1 cursor-pointer"
                        style={{ backgroundColor: event.color + "33" }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(event)
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        {event.startTime && (
                          <div className="text-[10px]">
                            {event.startTime}
                            {event.endTime ? ` - ${event.endTime}` : ""}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render day view
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayEvents = getEventsForDate(currentDate)

    return (
      <div className="flex flex-col">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">{format(currentDate, "EEEE, MMMM d, yyyy")}</h3>

          {/* All-day events */}
          {dayEvents.filter((event) => event.allDay).length > 0 && (
            <div className="mt-2 space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">All-day events</h4>
              {dayEvents
                .filter((event) => event.allDay)
                .map((event) => (
                  <div
                    key={event.id}
                    className="text-sm p-2 rounded cursor-pointer"
                    style={{ backgroundColor: event.color + "33" }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {event.title}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="overflow-y-auto max-h-[500px]">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter((event) => {
              if (event.allDay) return false
              if (!event.startTime) return false

              const eventHour = Number.parseInt(event.startTime.split(":")[0])
              return eventHour === hour
            })

            return (
              <div key={hour} className="flex border-b min-h-[60px]">
                <div className="w-16 p-1 text-xs text-muted-foreground border-r text-right pr-2 flex-shrink-0">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </div>

                <div
                  className="flex-1 p-1"
                  onClick={() => {
                    setNewEvent({
                      ...newEvent,
                      date: formatISO(currentDate, { representation: "date" }),
                      startTime: `${hour.toString().padStart(2, "0")}:00`,
                      endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
                    })
                    if (allowEditing) {
                      setIsAddEventOpen(true)
                    }
                  }}
                >
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-sm p-2 rounded mb-1 cursor-pointer"
                      style={{ backgroundColor: event.color + "33" }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEvent(event)
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      {event.startTime && (
                        <div className="text-xs flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.startTime}
                          {event.endTime ? ` - ${event.endTime}` : ""}
                        </div>
                      )}
                      {event.location && (
                        <div className="text-xs flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8 group relative" data-component-type="enhanced-calendar">
      {editMode && (
        <div
          className="drag-handle absolute top-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex items-center gap-1 z-20"
          data-drag-handle
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-grip"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="19" cy="5" r="1" />
            <circle cx="5" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
            <circle cx="19" cy="19" r="1" />
            <circle cx="5" cy="19" r="1" />
          </svg>
          Drag to reorder
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              {title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={navigateToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <CardDescription className="text-lg font-medium">
              {viewType === "month"
                ? format(currentDate, "MMMM yyyy")
                : viewType === "week"
                  ? `Week of ${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`
                  : format(currentDate, "EEEE, MMMM d, yyyy")}
            </CardDescription>
            <div className="flex items-center">
              <Tabs value={viewType} onValueChange={(value) => setViewType(value as "month" | "week" | "day")}>
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>
              </Tabs>
              {allowEditing && (
                <Button variant="outline" size="sm" className="ml-2" onClick={() => setIsAddEventOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewType === "month" && renderMonthView()}
          {viewType === "week" && renderWeekView()}
          {viewType === "day" && renderDayView()}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: selectedEvent.color || "#3b82f6" }}
                ></div>
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription>{format(parseISO(selectedEvent.date), "EEEE, MMMM d, yyyy")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedEvent.allDay ? (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>All day</span>
                </div>
              ) : selectedEvent.startTime ? (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {selectedEvent.startTime}
                    {selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ""}
                  </span>
                </div>
              ) : null}

              {selectedEvent.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              {allowEditing && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this event?")) {
                      handleDeleteEvent(selectedEvent.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>Create a new event on your calendar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                placeholder="Event title"
                value={newEvent.title || ""}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={newEvent.date || ""}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="all-day"
                checked={newEvent.allDay || false}
                onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
              />
              <Label htmlFor="all-day">All day event</Label>
            </div>

            {!newEvent.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newEvent.startTime || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newEvent.endTime || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                placeholder="Event location"
                value={newEvent.location || ""}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                placeholder="Event description"
                value={newEvent.description || ""}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-color">Color</Label>
              <div className="flex space-x-2">
                {["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"].map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer ${
                      newEvent.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
