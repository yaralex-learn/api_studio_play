"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserData {
  id: number
  name: string
  email: string
  avatar: string
  accuracy: number
  progress: number // Changed from timeSpent
  lastActive: string
}

interface ScatterPlotProps {
  data: UserData[]
  onUserSelect: (selectedUsers: UserData[]) => void
}

export function ScatterPlot({ data = [], onUserSelect }: ScatterPlotProps) {
  // Sample data to use when no data is provided
  const sampleData: UserData[] = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 85,
      progress: 12,
      lastActive: "2023-04-15",
    },
    {
      id: 2,
      name: "Maria Garcia",
      email: "maria@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 92,
      progress: 18,
      lastActive: "2023-04-16",
    },
    {
      id: 3,
      name: "John Smith",
      email: "john@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 78,
      progress: 8,
      lastActive: "2023-04-14",
    },
    {
      id: 4,
      name: "Sarah Lee",
      email: "sarah@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 95,
      progress: 22,
      lastActive: "2023-04-17",
    },
    {
      id: 5,
      name: "David Kim",
      email: "david@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 65,
      progress: 5,
      lastActive: "2023-04-13",
    },
    {
      id: 6,
      name: "Emma Wilson",
      email: "emma@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 88,
      progress: 15,
      lastActive: "2023-04-16",
    },
    {
      id: 7,
      name: "Michael Brown",
      email: "michael@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 72,
      progress: 9,
      lastActive: "2023-04-14",
    },
    {
      id: 8,
      name: "Sophia Martinez",
      email: "sophia@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 90,
      progress: 20,
      lastActive: "2023-04-17",
    },
    {
      id: 9,
      name: "James Taylor",
      email: "james@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 82,
      progress: 14,
      lastActive: "2023-04-15",
    },
    {
      id: 10,
      name: "Olivia Anderson",
      email: "olivia@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 97,
      progress: 25,
      lastActive: "2023-04-18",
    },
    {
      id: 11,
      name: "Daniel Thomas",
      email: "daniel@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 70,
      progress: 7,
      lastActive: "2023-04-13",
    },
    {
      id: 12,
      name: "Ava White",
      email: "ava@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      accuracy: 86,
      progress: 16,
      lastActive: "2023-04-16",
    },
  ]
  // Use sample data if no data is provided
  const displayData = data.length > 0 ? data : sampleData
  const handleUserSelect = (users: UserData[]) => {
    onUserSelect ? onUserSelect(users) : console.log("Selected users:", users)
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedPoints, setSelectedPoints] = useState<number[]>([])
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Calculate scales for plotting
  const maxProgress = Math.max(...displayData.map((d) => d.progress), 10)
  const maxAccuracy = 100

  // Draw the scatter plot
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

    // Draw axes
    const padding = 40
    const plotWidth = rect.width - padding * 2
    const plotHeight = rect.height - padding * 2

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, rect.height - padding)
    ctx.lineTo(rect.width - padding, rect.height - padding)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, rect.height - padding)
    ctx.stroke()

    // X-axis label
    ctx.fillStyle = "#666"
    ctx.textAlign = "center"
    ctx.fillText("Progress (Completed Quizzes)", rect.width / 2, rect.height - 10)

    // Y-axis label
    ctx.save()
    ctx.translate(15, rect.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Accuracy (%)", 0, 0)
    ctx.restore()

    // Draw points
    displayData.forEach((user, index) => {
      const x = padding + (user.progress / maxProgress) * plotWidth
      const y = rect.height - padding - (user.accuracy / maxAccuracy) * plotHeight

      // Draw point
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)

      // Set color based on selection state
      if (selectedPoints.includes(index)) {
        ctx.fillStyle = "#f97316" // Orange for selected points
      } else if (hoveredPoint === index) {
        ctx.fillStyle = "#3b82f6" // Blue for hovered point
      } else {
        ctx.fillStyle = "#6b7280" // Gray for normal points
      }

      ctx.fill()
    })
  }, [displayData, selectedPoints, hoveredPoint, maxProgress])

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const padding = 40
    const plotWidth = rect.width - padding * 2
    const plotHeight = rect.height - padding * 2

    // Check if any point was clicked
    let clickedPointIndex = -1
    displayData.forEach((user, index) => {
      const pointX = padding + (user.progress / maxProgress) * plotWidth
      const pointY = rect.height - padding - (user.accuracy / maxAccuracy) * plotHeight

      const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2)
      if (distance <= 6) {
        clickedPointIndex = index
      }
    })

    if (clickedPointIndex !== -1) {
      // Toggle selection
      const newSelection = selectedPoints.includes(clickedPointIndex)
        ? selectedPoints.filter((i) => i !== clickedPointIndex)
        : [...selectedPoints, clickedPointIndex]

      setSelectedPoints(newSelection)

      // Update parent component with selected users
      const selectedUsersData = displayData.filter((_, index) => newSelection.includes(index))
      handleUserSelect(selectedUsersData)
    }
  }

  // Handle canvas mouse move for tooltip
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const padding = 40
    const plotWidth = rect.width - padding * 2
    const plotHeight = rect.height - padding * 2

    // Check if mouse is over any point
    let hoveredIndex = null
    displayData.forEach((user, index) => {
      const pointX = padding + (user.progress / maxProgress) * plotWidth
      const pointY = rect.height - padding - (user.accuracy / maxAccuracy) * plotHeight

      const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2)
      if (distance <= 6) {
        hoveredIndex = index
      }
    })

    // Only update state if there's a change to avoid unnecessary re-renders
    if (hoveredIndex !== hoveredPoint) {
      setHoveredPoint(hoveredIndex)
    }

    if (hoveredIndex !== null) {
      setTooltipPosition({ x: e.clientX, y: e.clientY })
    }
  }

  // Handle canvas mouse leave
  const handleCanvasMouseLeave = () => {
    setHoveredPoint(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accuracy vs. Progress</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[300px] cursor-pointer"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
        />

        {/* Tooltip */}
        {hoveredPoint !== null && (
          <div
            className="absolute z-10 p-2 bg-background border rounded shadow-md text-sm"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 80}px`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-semibold">{displayData[hoveredPoint].name}</div>
            <div>Accuracy: {displayData[hoveredPoint].accuracy}%</div>
            <div>Progress: {displayData[hoveredPoint].progress} quizzes</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
