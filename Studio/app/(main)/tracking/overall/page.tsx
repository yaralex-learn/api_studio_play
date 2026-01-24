"use client"

import { useState, useCallback, useMemo } from "react"
import { FilterControls } from "@/components/tracking/filter-controls"
import { ScatterPlot } from "@/components/tracking/scatter-plot"
import { Histogram } from "@/components/tracking/histograms"
import { SelectedUsersTable } from "@/components/tracking/selected-users-table"
import { recentUsers, userTrackingData } from "@/lib/tracking-data"

// Generate extended user data with accuracy and progress
const extendedUserData = recentUsers.map((user) => {
  const userData = userTrackingData[user.id]

  // Calculate total completed quizzes (progress)
  const totalQuizzes = userData.answers.reduce((sum, answer) => sum + answer.correct + answer.incorrect, 0)

  // Calculate accuracy
  const totalCorrect = userData.answers.reduce((sum, answer) => sum + answer.correct, 0)
  const accuracy = Math.round((totalCorrect / totalQuizzes) * 100)

  return {
    ...user,
    accuracy,
    progress: totalQuizzes, // Use total quizzes as progress metric
    timeSpent: Math.round(userData.stats.totalTimeSpent / 60), // Keep timeSpent for histograms
  }
})

// Add more sample users with varied progress and accuracy
const sampleUsers = [
  {
    id: 101,
    name: "Sample User 1",
    email: "sample1@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    accuracy: 95,
    progress: 28,
    timeSpent: 42,
    lastActive: "2023-12-14T10:30:00Z",
  },
  {
    id: 102,
    name: "Sample User 2",
    email: "sample2@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    accuracy: 88,
    progress: 22,
    timeSpent: 35,
    lastActive: "2023-12-14T11:15:00Z",
  },
  {
    id: 103,
    name: "Sample User 3",
    email: "sample3@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    accuracy: 75,
    progress: 15,
    timeSpent: 28,
    lastActive: "2023-12-14T09:45:00Z",
  },
  {
    id: 104,
    name: "Sample User 4",
    email: "sample4@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    accuracy: 62,
    progress: 8,
    timeSpent: 20,
    lastActive: "2023-12-14T08:30:00Z",
  },
  {
    id: 105,
    name: "Sample User 5",
    email: "sample5@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    accuracy: 98,
    progress: 35,
    timeSpent: 50,
    lastActive: "2023-12-14T12:00:00Z",
  },
  {
    id: 106,
    name: "Sample User 6",
    email: "sample6@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    accuracy: 82,
    progress: 18,
    timeSpent: 32,
    lastActive: "2023-12-14T10:15:00Z",
  },
  {
    id: 107,
    name: "Sample User 7",
    email: "sample7@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    accuracy: 70,
    progress: 12,
    timeSpent: 25,
    lastActive: "2023-12-14T09:00:00Z",
  },
  {
    id: 108,
    name: "Sample User 8",
    email: "sample8@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    accuracy: 90,
    progress: 25,
    timeSpent: 40,
    lastActive: "2023-12-14T11:30:00Z",
  },
]

// Combine real and sample users
const combinedUserData = [...extendedUserData, ...sampleUsers]

export default function OverallTrackingPage() {
  const [filters, setFilters] = useState({
    channel: "All Channels",
    section: "All Sections",
    unit: "All Units",
    step: "All Steps",
  })

  const [selectedUsers, setSelectedUsers] = useState<typeof extendedUserData>([])
  const [selectionSource, setSelectionSource] = useState<string | null>(null)

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: {
      channel: string
      section: string
      unit: string
      step: string
    }) => {
      setFilters(newFilters)
    },
    [],
  )

  // Handle user selection from any visualization - memoize this function
  const handleUserSelect = useCallback((users: typeof extendedUserData, source: string) => {
    setSelectedUsers(users)
    setSelectionSource(users.length > 0 ? source : null)
  }, [])

  // Clear selected users
  const handleClearSelection = useCallback(() => {
    setSelectedUsers([])
    setSelectionSource(null)
  }, [])

  // Memoize the selection handlers for each visualization
  const scatterSelectHandler = useCallback(
    (users: typeof extendedUserData) => {
      handleUserSelect(users, "scatter")
    },
    [handleUserSelect],
  )

  const accuracySelectHandler = useCallback(
    (users: typeof extendedUserData) => {
      handleUserSelect(users, "accuracy")
    },
    [handleUserSelect],
  )

  const progressSelectHandler = useCallback(
    (users: typeof extendedUserData) => {
      handleUserSelect(users, "progress")
    },
    [handleUserSelect],
  )

  // Memoize the data to prevent unnecessary re-renders
  const userData = useMemo(() => combinedUserData, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overall User Performance</h1>
        <p className="text-muted-foreground">Analyze user performance across different metrics and filters</p>
      </div>

      {/* Filter Controls */}
      <FilterControls onFilterChange={handleFilterChange} />

      {/* Scatter Plot */}
      <ScatterPlot data={userData} onUserSelect={scatterSelectHandler} />

      {/* Distribution Histograms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Histogram data={userData} type="accuracy" onUserSelect={accuracySelectHandler} />
        <Histogram data={userData} type="progress" onUserSelect={progressSelectHandler} />
      </div>

      {/* Selected Users Table */}
      <SelectedUsersTable users={selectedUsers} onClear={handleClearSelection} selectionSource={selectionSource} />
    </div>
  )
}
