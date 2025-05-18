"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns"

interface CalendarEvent {
  id: string
  title: string
  date: string
  description?: string
  location?: string
  url?: string
}

interface CalendarProps {
  title?: string
  events: CalendarEvent[]
  viewType?: "month" | "week" | "day"
  editMode?: boolean
}

export function Calendar({ title, events, viewType = "month", editMode = false }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get days for the current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get events for the selected date
  const selectedDateEvents = selectedDate ? events.filter((event) => isSameDay(parseISO(event.date), selectedDate)) : []

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Check if a date has events
  const hasEvents = (date: Date) => {
    return events.some((event) => isSameDay(parseISO(event.date), date))
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-8 group relative" data-component-type="calendar">
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

      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="h-10 rounded-md"></div>
                ))}
                {monthDays.map((day) => (
                  <Button
                    key={day.toISOString()}
                    variant={isSameDay(day, selectedDate || new Date(-1)) ? "default" : "outline"}
                    className={`h-10 ${
                      hasEvents(day) ? "border-primary border-2" : ""
                    } ${!isSameMonth(day, currentDate) ? "text-muted-foreground" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    {format(day, "d")}
                  </Button>
                ))}
                {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                  <div key={`empty-end-${index}`} className="h-10 rounded-md"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Events"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{format(parseISO(event.date), "h:mm a")}</p>
                      {event.description && <p className="text-sm mt-1">{event.description}</p>}
                      {event.location && <p className="text-sm text-muted-foreground mt-1">📍 {event.location}</p>}
                      {event.url && (
                        <a href={event.url} className="text-sm text-primary hover:underline mt-2 inline-block">
                          More details
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {selectedDate ? "No events scheduled for this day" : "Select a date to view scheduled events"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
