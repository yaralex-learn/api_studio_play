"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimePickerProps {
  time?: Date
  onSelect: (time: Date | undefined) => void
  className?: string
  id?: string
  title?: string
  description?: string
}

export function TimePicker({
  time,
  onSelect,
  className,
  id,
  title = "Select time",
  description = "Choose a time from the options below.",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedTime, setSelectedTime] = React.useState<Date | undefined>(time)

  // Extract hours, minutes, and period from the time
  const hours = selectedTime ? selectedTime.getHours() % 12 || 12 : 12
  const minutes = selectedTime ? selectedTime.getMinutes() : 0
  const period = selectedTime ? (selectedTime.getHours() >= 12 ? "PM" : "AM") : "AM"

  // Update internal state when external time changes
  React.useEffect(() => {
    setSelectedTime(time)
  }, [time])

  const handleHoursChange = (value: string) => {
    const newTime = new Date(selectedTime || new Date())
    let newHours = Number.parseInt(value, 10)

    // Convert to 24-hour format if PM
    if (period === "PM" && newHours < 12) {
      newHours += 12
    }
    // Convert 12 AM to 0 hours
    if (period === "AM" && newHours === 12) {
      newHours = 0
    }

    newTime.setHours(newHours)
    setSelectedTime(newTime)
  }

  const handleMinutesChange = (value: string) => {
    const newTime = new Date(selectedTime || new Date())
    newTime.setMinutes(Number.parseInt(value, 10))
    setSelectedTime(newTime)
  }

  const handlePeriodChange = (value: string) => {
    const newTime = new Date(selectedTime || new Date())
    const currentHours = newTime.getHours()

    if (value === "AM" && currentHours >= 12) {
      // Convert from PM to AM
      newTime.setHours(currentHours - 12)
    } else if (value === "PM" && currentHours < 12) {
      // Convert from AM to PM
      newTime.setHours(currentHours + 12)
    }

    setSelectedTime(newTime)
  }

  const handleConfirm = () => {
    onSelect(selectedTime)
    setOpen(false)
  }

  const handleCancel = () => {
    setSelectedTime(time) // Reset to the original time
    setOpen(false)
  }

  // Format time for display
  const formatTime = (date?: Date) => {
    if (!date) return "Pick a time"

    const hours = date.getHours() % 12 || 12
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const period = date.getHours() >= 12 ? "PM" : "AM"

    return `${hours}:${minutes} ${period}`
  }

  // Generate hours options (1-12)
  const hoursOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1
    return (
      <SelectItem key={hour} value={hour.toString()}>
        {hour}
      </SelectItem>
    )
  })

  // Generate minutes options (00-59)
  const minutesOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, "0")
    return (
      <SelectItem key={minute} value={minute}>
        {minute}
      </SelectItem>
    )
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <Button
        id={id}
        variant={"outline"}
        onClick={() => setOpen(true)}
        className={cn("w-full justify-start text-left font-normal", !time && "text-muted-foreground")}
      >
        <Clock className="mr-2 h-4 w-4" />
        {formatTime(time)}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90dvw] max-w-[24rem]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="py-4 grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hours</label>
              <Select value={hours.toString()} onValueChange={handleHoursChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>{hoursOptions}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minutes</label>
              <Select value={minutes.toString().padStart(2, "0")} onValueChange={handleMinutesChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>{minutesOptions}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">AM/PM</label>
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
