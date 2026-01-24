"use client"
import { format } from "date-fns"
import React from "react"

import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface DatePickerProps {
  date?: Date
  onSelect: (date: Date | undefined) => void
  className?: string
  id?: string
  title?: string
  description?: string
}

export function DatePicker({
  date,
  onSelect,
  className,
  id,
  title = "Select date",
  description = "Choose a date from the calendar below.",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)

  // Update internal state when external date changes
  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handleConfirm = () => {
    onSelect(selectedDate)
    setOpen(false)
  }

  const handleCancel = () => {
    setSelectedDate(date) // Reset to the original date
    setOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Button
        id={id}
        variant={"outline"}
        onClick={() => setOpen(true)}
        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : <span>Pick a date</span>}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90dvw] max-w-[24rem]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="py-4 w-full">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              initialFocus
              className="w-full mx-auto"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .react-day-picker {
          width: 100%;
        }
        .rdp {
          padding: 0;
        }
        .rdp-caption_start {
          width: 100%;
        }
        .rdp-months {
          width: 100%;
          justify-content: center;
        }
        .rdp-month {
          width: 100%;
        }
        .rdp-table {
          width: 100%;
          max-width: 100%;
        }
        .rdp-head tr {
          justify-content: space-between;
        }
        .rdp-tbody tr {
          justify-content: space-between;
        }
      `}</style>
    </div>
  )
}
