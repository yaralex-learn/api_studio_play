"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserData {
  id: number
  name: string
  email: string
  avatar: string
  accuracy: number
  progress: number
  timeSpent: number
  lastActive: string
}

interface HistogramProps {
  data: UserData[]
  type: "timeSpent" | "accuracy" | "activeUsers" | "progress"
  onUserSelect?: (users: UserData[]) => void
}

export function Histogram({ data, type, onUserSelect }: HistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedBin, setSelectedBin] = useState<number | null>(null)

  // Store bin ranges and values for selection handling
  const binRangesRef = useRef<Array<{ min: number; max: number }>>([])
  const valuesRef = useRef<number[]>([])
  const labelsRef = useRef<string[]>([])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onUserSelect || !canvasRef.current) return

      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const padding = 40
      const plotWidth = rect.width - padding * 2

      // Calculate which bin was clicked
      const binWidth = plotWidth / binRangesRef.current.length
      const binIndex = Math.floor((x - padding) / binWidth)

      if (binIndex >= 0 && binIndex < binRangesRef.current.length) {
        // Toggle selection
        const newSelectedBin = selectedBin === binIndex ? null : binIndex
        setSelectedBin(newSelectedBin)

        if (newSelectedBin === null) {
          // If deselected, clear selection
          onUserSelect([])
        } else {
          // If selected, filter users in this bin
          const { min, max } = binRangesRef.current[newSelectedBin]
          let selectedUsers: UserData[] = []

          if (type === "accuracy") {
            selectedUsers = data.filter((user) => user.accuracy >= min && user.accuracy <= max)
          } else if (type === "progress") {
            selectedUsers = data.filter((user) => user.progress >= min && user.progress <= max)
          } else if (type === "timeSpent") {
            selectedUsers = data.filter((user) => user.timeSpent >= min && user.timeSpent < max)
          }

          onUserSelect(selectedUsers)
        }
      }
    },
    [data, onUserSelect, selectedBin, type],
  )

  // Reset selection when type changes, but not on every data change
  useEffect(() => {
    setSelectedBin(null)
  }, [type])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Define bins
    let bins: number[] = []
    let labels: string[] = []
    const values: number[] = []
    const binRanges: Array<{ min: number; max: number }> = []

    if (type === "activeUsers") {
      // Create time periods for the last 7 days
      const today = new Date()
      labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(date.getDate() - (6 - i))
        return date.toLocaleDateString("en-US", { weekday: "short" })
      })

      // Count active users for each day
      // For sample data, generate random counts between 5-30
      values.push(...Array.from({ length: 7 }, () => Math.floor(Math.random() * 25) + 5))

      // No bin ranges for active users
      labels.forEach(() => binRanges.push({ min: 0, max: 0 }))
    } else if (type === "timeSpent") {
      // Time spent bins (0-30, 31-60, 61-90, 91-120, >120)
      bins = [0, 30, 60, 90, 120, Number.POSITIVE_INFINITY]
      labels = ["0-30", "31-60", "61-90", "91-120", ">120"]

      // Count users in each bin
      for (let i = 0; i < bins.length - 1; i++) {
        const count = data.filter((d) => d.timeSpent >= bins[i] && d.timeSpent < bins[i + 1]).length
        values.push(count)
        binRanges.push({ min: bins[i], max: bins[i + 1] })
      }
    } else if (type === "progress") {
      // Progress bins (0-5, 6-10, 11-15, 16-20, >20)
      bins = [0, 5, 10, 15, 20, Number.POSITIVE_INFINITY]
      labels = ["0-5", "6-10", "11-15", "16-20", ">20"]

      // Count users in each bin
      for (let i = 0; i < bins.length - 1; i++) {
        const count = data.filter((d) => d.progress >= bins[i] && d.progress < bins[i + 1]).length
        values.push(count)
        binRanges.push({ min: bins[i], max: bins[i + 1] })
      }
    } else {
      // Accuracy bins (0-20, 21-40, 41-60, 61-80, 81-100)
      bins = [0, 20, 40, 60, 80, 100]
      labels = ["0-20%", "21-40%", "41-60%", "61-80%", "81-100%"]

      // Count users in each bin
      for (let i = 0; i < bins.length - 1; i++) {
        const count = data.filter((d) => d.accuracy >= bins[i] && d.accuracy <= bins[i + 1]).length
        values.push(count)
        binRanges.push({ min: bins[i], max: bins[i + 1] })
      }
    }

    // Store for click handling
    binRangesRef.current = binRanges
    valuesRef.current = values
    labelsRef.current = labels

    // Draw histogram
    const padding = 40
    const barPadding = 10
    const plotWidth = rect.width - padding * 2
    const plotHeight = rect.height - padding * 2
    const barWidth = (plotWidth - barPadding * (values.length - 1)) / values.length

    const maxValue = Math.max(...values, 1)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, rect.height - padding)
    ctx.lineTo(rect.width - padding, rect.height - padding)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, rect.height - padding)
    ctx.stroke()

    // X-axis label
    ctx.fillStyle = "#666"
    ctx.textAlign = "center"
    if (type === "activeUsers") {
      ctx.fillText("Day of Week", rect.width / 2, rect.height - 10)
    } else if (type === "progress") {
      ctx.fillText("Completed Quizzes", rect.width / 2, rect.height - 10)
    } else {
      ctx.fillText(type === "timeSpent" ? "Time Spent (minutes)" : "Accuracy (%)", rect.width / 2, rect.height - 10)
    }

    // Y-axis label
    ctx.save()
    ctx.translate(15, rect.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Number of Users", 0, 0)
    ctx.restore()

    // Draw bars
    values.forEach((value, index) => {
      const barHeight = (value / maxValue) * plotHeight
      const x = padding + index * (barWidth + barPadding)
      const y = rect.height - padding - barHeight

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, rect.height - padding)

      if (type === "activeUsers") {
        gradient.addColorStop(0, "#8b5cf6") // Purple
        gradient.addColorStop(1, "#c4b5fd") // Light purple
      } else if (type === "timeSpent") {
        gradient.addColorStop(0, "#3b82f6") // Blue
        gradient.addColorStop(1, "#93c5fd") // Light blue
      } else if (type === "progress") {
        gradient.addColorStop(0, "#f59e0b") // Amber
        gradient.addColorStop(1, "#fcd34d") // Light amber
      } else {
        gradient.addColorStop(0, "#10b981") // Green
        gradient.addColorStop(1, "#6ee7b7") // Light green
      }

      // Highlight selected bin
      if (selectedBin === index) {
        ctx.fillStyle =
          type === "accuracy"
            ? "#059669" // Darker green
            : type === "progress"
              ? "#d97706" // Darker amber
              : "#2563eb" // Darker blue
      } else {
        ctx.fillStyle = gradient
      }

      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw bar value
      ctx.fillStyle = "#000"
      ctx.textAlign = "center"
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5)

      // Draw x-axis label
      ctx.fillStyle = "#666"
      ctx.fillText(labels[index], x + barWidth / 2, rect.height - padding + 15)
    })
  }, [data, type, selectedBin])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === "timeSpent"
            ? "Time Spent Distribution"
            : type === "accuracy"
              ? "Accuracy Distribution"
              : type === "progress"
                ? "Progress Distribution"
                : "Active Users Over Time"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          className={`w-full h-[250px] ${onUserSelect ? "cursor-pointer" : ""}`}
          onClick={onUserSelect ? handleCanvasClick : undefined}
        />
      </CardContent>
    </Card>
  )
}
