"use client"

import { useState, useMemo } from "react"
import { Search, Calendar, BarChart2, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { recentUsers, userTrackingData } from "@/lib/tracking-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Activity Heatmap component
function ActivityHeatmap({ userData }: { userData: any }) {
  // Generate sample activity data for the last 12 weeks (84 days)
  const activityData = useMemo(() => {
    if (!userData || !userData.timeSpent) return []

    const today = new Date()
    const data = []

    // Fill with actual data where available, otherwise use zeros
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // Find matching date in user data or default to 0
      const matchingDay = userData.timeSpent.find(
        (day: any) => day.date === dateStr.substring(5), // Match month-day format
      )

      data.push({
        date: dateStr,
        count: matchingDay ? matchingDay.minutes : 0,
        level: matchingDay
          ? matchingDay.minutes === 0
            ? 0
            : matchingDay.minutes < 15
              ? 1
              : matchingDay.minutes < 30
                ? 2
                : matchingDay.minutes < 45
                  ? 3
                  : 4
          : 0,
      })
    }

    return data
  }, [userData])

  // Group data by week and day for the heatmap
  const weeks = useMemo(() => {
    const result = []
    for (let i = 0; i < 12; i++) {
      result.push(activityData.slice(i * 7, (i + 1) * 7))
    }
    return result
  }, [activityData])

  // Get day labels (Sun-Sat)
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Daily activity over the past 12 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-3 w-3 rounded-sm bg-muted"></div>
              <div className="h-3 w-3 rounded-sm bg-emerald-100 dark:bg-emerald-900"></div>
              <div className="h-3 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-700"></div>
              <div className="h-3 w-3 rounded-sm bg-emerald-500"></div>
              <div className="h-3 w-3 rounded-sm bg-emerald-700 dark:bg-emerald-300"></div>
            </div>
            <span>More</span>
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="mr-2 mt-6 flex flex-col justify-between text-xs text-muted-foreground">
              {dayLabels.map((day, i) => (
                <span key={day} className={i % 2 === 0 ? "invisible" : ""}>
                  {day}
                </span>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`h-3 w-3 rounded-sm ${
                          day.level === 0
                            ? "bg-muted"
                            : day.level === 1
                              ? "bg-emerald-100 dark:bg-emerald-900"
                              : day.level === 2
                                ? "bg-emerald-300 dark:bg-emerald-700"
                                : day.level === 3
                                  ? "bg-emerald-500"
                                  : "bg-emerald-700 dark:bg-emerald-300"
                        }`}
                        title={`${formatDate(day.date)}: ${day.count} minutes`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Month labels */}
              <div className="mt-1 flex text-xs text-muted-foreground">
                {Array.from({ length: 12 }).map((_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (83 - i * 7))
                  const month = date.toLocaleDateString("en-US", { month: "short" })
                  // Only show label if it's the first day of the month or first in our range
                  const showLabel = date.getDate() <= 7 || i === 0
                  return (
                    <div key={i} className="flex-1">
                      {showLabel && <span>{month}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Sample data for steps and quizzes
const sampleStepData = {
  "Web Development Fundamentals": {
    "HTML Basics": [
      {
        step: "Introduction to HTML",
        quizzes: [
          { type: "Multiple Choice", correct: 12, incorrect: 3, total: 15 },
          { type: "Fill in the Blank", correct: 8, incorrect: 2, total: 10 },
          { type: "True/False", correct: 5, incorrect: 0, total: 5 },
        ],
      },
      {
        step: "HTML Elements",
        quizzes: [
          { type: "Multiple Choice", correct: 15, incorrect: 2, total: 17 },
          { type: "Matching", correct: 7, incorrect: 3, total: 10 },
          { type: "Fill in the Blank", correct: 6, incorrect: 4, total: 10 },
        ],
      },
      {
        step: "HTML Attributes",
        quizzes: [
          { type: "Multiple Choice", correct: 10, incorrect: 5, total: 15 },
          { type: "True/False", correct: 8, incorrect: 2, total: 10 },
        ],
      },
      {
        step: "HTML Forms",
        quizzes: [
          { type: "Multiple Choice", correct: 8, incorrect: 7, total: 15 },
          { type: "Fill in the Blank", correct: 5, incorrect: 5, total: 10 },
          { type: "Matching", correct: 6, incorrect: 4, total: 10 },
        ],
      },
      {
        step: "HTML Tables",
        quizzes: [
          { type: "Multiple Choice", correct: 9, incorrect: 6, total: 15 },
          { type: "True/False", correct: 7, incorrect: 3, total: 10 },
        ],
      },
    ],
    "CSS Basics": [
      {
        step: "Introduction to CSS",
        quizzes: [
          { type: "Multiple Choice", correct: 10, incorrect: 5, total: 15 },
          { type: "Fill in the Blank", correct: 7, incorrect: 3, total: 10 },
        ],
      },
      {
        step: "CSS Selectors",
        quizzes: [
          { type: "Multiple Choice", correct: 11, incorrect: 4, total: 15 },
          { type: "Matching", correct: 8, incorrect: 2, total: 10 },
        ],
      },
      {
        step: "CSS Box Model",
        quizzes: [
          { type: "Multiple Choice", correct: 9, incorrect: 6, total: 15 },
          { type: "True/False", correct: 6, incorrect: 4, total: 10 },
          { type: "Fill in the Blank", correct: 7, incorrect: 3, total: 10 },
        ],
      },
      {
        step: "CSS Layout",
        quizzes: [
          { type: "Multiple Choice", correct: 8, incorrect: 7, total: 15 },
          { type: "Matching", correct: 5, incorrect: 5, total: 10 },
        ],
      },
      {
        step: "CSS Flexbox",
        quizzes: [
          { type: "Multiple Choice", correct: 7, incorrect: 8, total: 15 },
          { type: "Fill in the Blank", correct: 4, incorrect: 6, total: 10 },
        ],
      },
    ],
  },
  "JavaScript Essentials": {
    "Variables and Data Types": [
      {
        step: "Introduction to Variables",
        quizzes: [
          { type: "Multiple Choice", correct: 8, incorrect: 4, total: 12 },
          { type: "Fill in the Blank", correct: 6, incorrect: 4, total: 10 },
        ],
      },
      {
        step: "Data Types Overview",
        quizzes: [
          { type: "Multiple Choice", correct: 14, incorrect: 2, total: 16 },
          { type: "True/False", correct: 8, incorrect: 2, total: 10 },
        ],
      },
      {
        step: "Working with Strings",
        quizzes: [
          { type: "Multiple Choice", correct: 10, incorrect: 5, total: 15 },
          { type: "Fill in the Blank", correct: 7, incorrect: 3, total: 10 },
        ],
      },
      {
        step: "Working with Numbers",
        quizzes: [
          { type: "Multiple Choice", correct: 9, incorrect: 6, total: 15 },
          { type: "True/False", correct: 6, incorrect: 4, total: 10 },
        ],
      },
      {
        step: "Working with Arrays",
        quizzes: [
          { type: "Multiple Choice", correct: 7, incorrect: 8, total: 15 },
          { type: "Fill in the Blank", correct: 5, incorrect: 5, total: 10 },
          { type: "Matching", correct: 6, incorrect: 4, total: 10 },
        ],
      },
    ],
    "Control Flow": [
      {
        step: "Conditional Statements",
        quizzes: [
          { type: "Multiple Choice", correct: 12, incorrect: 4, total: 16 },
          { type: "Fill in the Blank", correct: 8, incorrect: 2, total: 10 },
        ],
      },
      {
        step: "Loops",
        quizzes: [
          { type: "Multiple Choice", correct: 10, incorrect: 5, total: 15 },
          { type: "True/False", correct: 7, incorrect: 3, total: 10 },
        ],
      },
      {
        step: "Switch Statements",
        quizzes: [
          { type: "Multiple Choice", correct: 9, incorrect: 6, total: 15 },
          { type: "Fill in the Blank", correct: 6, incorrect: 4, total: 10 },
        ],
      },
      {
        step: "Error Handling",
        quizzes: [
          { type: "Multiple Choice", correct: 8, incorrect: 7, total: 15 },
          { type: "True/False", correct: 5, incorrect: 5, total: 10 },
        ],
      },
      {
        step: "Logical Operators",
        quizzes: [
          { type: "Multiple Choice", correct: 11, incorrect: 4, total: 15 },
          { type: "Fill in the Blank", correct: 7, incorrect: 3, total: 10 },
        ],
      },
    ],
    Functions: [
      {
        step: "Function Basics",
        quizzes: [
          { type: "Multiple Choice", correct: 6, incorrect: 6, total: 12 },
          { type: "Fill in the Blank", correct: 4, incorrect: 6, total: 10 },
        ],
      },
      {
        step: "Function Parameters",
        quizzes: [
          { type: "Multiple Choice", correct: 9, incorrect: 3, total: 12 },
          { type: "True/False", correct: 7, incorrect: 3, total: 10 },
        ],
      },
      {
        step: "Return Values",
        quizzes: [
          { type: "Multiple Choice", correct: 10, incorrect: 5, total: 15 },
          { type: "Fill in the Blank", correct: 6, incorrect: 4, total: 10 },
        ],
      },
      {
        step: "Arrow Functions",
        quizzes: [
          { type: "Multiple Choice", correct: 8, incorrect: 7, total: 15 },
          { type: "True/False", correct: 5, incorrect: 5, total: 10 },
        ],
      },
      {
        step: "Callbacks",
        quizzes: [
          { type: "Multiple Choice", correct: 7, incorrect: 8, total: 15 },
          { type: "Fill in the Blank", correct: 4, incorrect: 6, total: 10 },
        ],
      },
    ],
  },
}

export function IndividualTracking() {
  // Make sure recentUsers has at least one item
  const [selectedUser, setSelectedUser] = useState(recentUsers.length > 0 ? recentUsers[0] : null)
  const [searchQuery, setSearchQuery] = useState("")
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  // Find these lines near the top of the component
  // Replace with:
  const [selectedChannel, setSelectedChannel] = useState("Web")
  const [selectedSection, setSelectedSection] = useState("")
  const [selectedUnit, setSelectedUnit] = useState("")
  const [selectedStep, setSelectedStep] = useState<string | null>(null)

  // Get user data for the selected user with fallback
  const userData = selectedUser && userTrackingData[selectedUser.id] ? userTrackingData[selectedUser.id] : null

  // Filter users based on search query
  const filteredUsers = searchQuery
    ? recentUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : recentUsers

  // Calculate accuracy stats based on filters
  const accuracyStats = useMemo(() => {
    if (!userData || !userData.answers) return { correct: 0, incorrect: 0, total: 0, percentage: 0 }

    const filteredAnswers = userData.answers.filter(
      (answer) =>
        answer.channel === selectedChannel &&
        (selectedSection === "" || answer.section === selectedSection) &&
        (selectedUnit === "" || answer.unit === selectedUnit),
    )

    const correct = filteredAnswers.reduce((sum, answer) => sum + answer.correct, 0)
    const incorrect = filteredAnswers.reduce((sum, answer) => sum + answer.incorrect, 0)
    const total = correct + incorrect
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

    return { correct, incorrect, total, percentage }
  }, [userData, selectedChannel, selectedSection, selectedUnit])

  // Get step data based on selected section and unit
  const stepData = useMemo(() => {
    if (!selectedSection || !selectedUnit) return []

    // Try to get data from sample data first
    const sectionData = sampleStepData[selectedSection]
    if (sectionData && sectionData[selectedUnit]) {
      return sectionData[selectedUnit].map((step) => {
        const totalCorrect = step.quizzes.reduce((sum, quiz) => sum + quiz.correct, 0)
        const totalQuestions = step.quizzes.reduce((sum, quiz) => sum + quiz.total, 0)
        const accuracy = Math.round((totalCorrect / totalQuestions) * 100)

        return {
          step: step.step,
          accuracy,
          correct: totalCorrect,
          total: totalQuestions,
          quizzes: step.quizzes,
        }
      })
    }

    // Fallback to user data if available
    if (userData && userData.answers) {
      const filteredAnswers = userData.answers.filter(
        (answer) => answer.section === selectedSection && answer.unit === selectedUnit,
      )

      return filteredAnswers.map((answer) => {
        const total = answer.correct + answer.incorrect
        const accuracy = Math.round((answer.correct / total) * 100)

        return {
          step: answer.step,
          accuracy,
          correct: answer.correct,
          total,
          quizzes: [
            {
              type: "Multiple Choice",
              correct: Math.round(answer.correct * 0.6),
              incorrect: Math.round(answer.incorrect * 0.6),
              total: Math.round((answer.correct + answer.incorrect) * 0.6),
            },
            {
              type: "Fill in the Blank",
              correct: Math.round(answer.correct * 0.4),
              incorrect: Math.round(answer.incorrect * 0.4),
              total: Math.round((answer.correct + answer.incorrect) * 0.4),
            },
          ],
        }
      })
    }

    return []
  }, [selectedSection, selectedUnit, userData])

  // Format date for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  // If no users are available, show a message
  if (recentUsers.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No user data available</AlertTitle>
        <AlertDescription>
          There are no users to track at this time. Please add users to the system to view tracking data.
        </AlertDescription>
      </Alert>
    )
  }

  // If no user data is available for the selected user, show a message
  if (!userData && selectedUser) {
    return (
      <div className="space-y-6">
        {/* User selection bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex-1 md:mr-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex-shrink-0">
                <p className="text-sm text-muted-foreground">Recent Users</p>
              </div>
            </div>

            <ScrollArea className="mt-4 whitespace-nowrap">
              <div className="flex space-x-4 p-1">
                {filteredUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant={selectedUser.id === user.id ? "default" : "outline"}
                    className="flex items-center space-x-2"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No tracking data available</AlertTitle>
          <AlertDescription>
            There is no tracking data available for {selectedUser.name}. Please select another user or check back later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User selection bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex-1 md:mr-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <p className="text-sm text-muted-foreground">Recent Users</p>
            </div>
          </div>

          <ScrollArea className="mt-4 whitespace-nowrap">
            <div className="flex space-x-4 p-1">
              {filteredUsers.map((user) => (
                <Button
                  key={user.id}
                  variant={selectedUser && selectedUser.id === user.id ? "default" : "outline"}
                  className="flex items-center space-x-2"
                  onClick={() => setSelectedUser(user)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* User tracking data - only render if userData is available */}
      {userData && selectedUser && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Activity Heatmap */}
            <ActivityHeatmap userData={userData} />

            {/* User stats card */}
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
                <CardDescription>Summary of {selectedUser.name}'s activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Active:</span>
                    <span className="ml-auto text-sm">{formatDateTime(userData.stats.lastActive)}</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Current Position:</span>
                    <span className="ml-auto text-sm">Section2-Unit4-Step5</span>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Completion Rate:</span>
                      <span className="text-sm">{userData.stats.completionRate}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${userData.stats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filter dropdowns */}
            {userData && selectedUser && (
              <Card className="md:col-span-3">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3">
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web">Web</SelectItem>
                        <SelectItem value="Mobile">Mobile</SelectItem>
                        <SelectItem value="Desktop">Desktop</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedSection}
                      onValueChange={(value) => {
                        setSelectedSection(value)
                        setSelectedUnit("")
                        setSelectedStep(null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {userData.answers &&
                          [...new Set(userData.answers.map((a) => a.section))].map((section) => (
                            <SelectItem key={section} value={section}>
                              {section}
                            </SelectItem>
                          ))}
                        {/* Add sample data sections */}
                        {Object.keys(sampleStepData).map((section) => (
                          <SelectItem key={section} value={section}>
                            {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedUnit}
                      onValueChange={(value) => {
                        setSelectedUnit(value)
                        setSelectedStep(null)
                      }}
                      disabled={!selectedSection}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedSection &&
                          sampleStepData[selectedSection] &&
                          Object.keys(sampleStepData[selectedSection]).map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        {userData.answers &&
                          [
                            ...new Set(
                              userData.answers.filter((a) => a.section === selectedSection).map((a) => a.unit),
                            ),
                          ].map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Step Accuracy Bar Chart */}
                  {selectedSection && selectedUnit && stepData.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-4 text-lg font-medium">Step Accuracy</h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stepData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            onClick={(data) => {
                              if (data && data.activePayload && data.activePayload[0]) {
                                setSelectedStep(data.activePayload[0].payload.step)
                              }
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="step" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                            <YAxis
                              label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft" }}
                              domain={[0, 100]}
                            />
                            <Tooltip
                              formatter={(value, name) => {
                                if (name === "accuracy") return [`${value}%`, "Accuracy"]
                                return [value, name]
                              }}
                              labelFormatter={(label) => `Step: ${label}`}
                            />
                            <Bar
                              dataKey="accuracy"
                              name="Accuracy"
                              fill="#8884d8"
                              cursor="pointer"
                              activeBar={{ fill: "#6b5ecc", stroke: "#5a4db5" }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Quiz Performance Details for Selected Step */}
                      {selectedStep && (
                        <div className="mt-6 rounded-lg border p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-medium">Quiz Performance for {selectedStep}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStep(null)}
                              className="h-8 px-2 text-xs"
                            >
                              Clear Selection
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {stepData
                              .find((step) => step.step === selectedStep)
                              ?.quizzes.map((quiz, index) => {
                                const quizAccuracy = Math.round((quiz.correct / quiz.total) * 100)

                                return (
                                  <div key={index} className="rounded border p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                      <span className="font-medium">{quiz.type}</span>
                                      <span
                                        className={`text-sm ${quizAccuracy >= 70 ? "text-green-600" : "text-red-600"}`}
                                      >
                                        {quizAccuracy}% Accuracy
                                      </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted">
                                      <div
                                        className={`h-2 rounded-full ${quizAccuracy >= 70 ? "bg-green-600" : "bg-red-600"}`}
                                        style={{ width: `${quizAccuracy}%` }}
                                      />
                                    </div>
                                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                      <span>Correct: {quiz.correct}</span>
                                      <span>Incorrect: {quiz.incorrect}</span>
                                      <span>Total: {quiz.total}</span>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Progress vs Accuracy graph - moved to bottom */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Progress vs Accuracy</CardTitle>
                <CardDescription>
                  Relationship between completed quizzes and accuracy for {selectedUser.name}
                </CardDescription>
              </CardHeader>
              <CardContent>{/* Progress vs Accuracy plot removed */}</CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
