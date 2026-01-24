"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"

interface DateTimePickerProps {
  date?: Date
  onSelect: (date: Date | undefined) => void
  className?: string
  id?: string
}

export function DateTimePicker({ date, onSelect, className, id }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)

  // Update internal state when external date changes
  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelectedDate(undefined)
      onSelect(undefined)
      return
    }

    // Preserve time from the current selectedDate if it exists
    if (selectedDate) {
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), selectedDate.getSeconds())
    }

    setSelectedDate(newDate)
    onSelect(newDate)
  }

  const handleTimeChange = (newTime: Date | undefined) => {
    if (!newTime) {
      return
    }

    // Create a new date to avoid mutating the original
    const updatedDate = new Date(selectedDate || new Date())
    updatedDate.setHours(newTime.getHours(), newTime.getMinutes(), 0)

    setSelectedDate(updatedDate)
    onSelect(updatedDate)
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <DatePicker id={id ? `${id}-date` : undefined} date={selectedDate} onSelect={handleDateChange} />
      <TimePicker id={id ? `${id}-time` : undefined} time={selectedDate} onSelect={handleTimeChange} />
    </div>
  )
}
