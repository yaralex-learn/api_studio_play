"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Send, Clock, BarChart3, Check, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  text: string
  type: "multiple-choice" | "poll"
  options: { id: string; text: string; correct?: boolean }[]
  responses: { optionId: string; count: number }[]
  status: "draft" | "active" | "ended"
  timeLimit?: number
}

interface LiveQuestionsProps {
  isLive: boolean
  activeQuestionId: string | null
  onActivateQuestion: (id: string | null) => void
}

export function LiveQuestions({ isLive, activeQuestionId, onActivateQuestion }: LiveQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      text: "What is the capital of France?",
      type: "multiple-choice",
      options: [
        { id: "o1", text: "London", correct: false },
        { id: "o2", text: "Paris", correct: true },
        { id: "o3", text: "Berlin", correct: false },
        { id: "o4", text: "Madrid", correct: false },
      ],
      responses: [
        { optionId: "o1", count: 3 },
        { optionId: "o2", count: 15 },
        { optionId: "o3", count: 2 },
        { optionId: "o4", count: 4 },
      ],
      status: "draft",
    },
    {
      id: "q2",
      text: "How well do you understand the current topic?",
      type: "poll",
      options: [
        { id: "o1", text: "Very well" },
        { id: "o2", text: "Somewhat" },
        { id: "o3", text: "Not at all" },
      ],
      responses: [
        { optionId: "o1", count: 8 },
        { optionId: "o2", count: 12 },
        { optionId: "o3", count: 4 },
      ],
      status: "draft",
    },
  ])

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [newQuestion, setNewQuestion] = useState("")

  const handleActivateQuestion = (questionId: string) => {
    // In a real app, this would send the question to all connected students
    setQuestions(
      questions.map((q) => ({
        ...q,
        status: q.id === questionId ? "active" : q.status === "active" ? "ended" : q.status,
      })),
    )

    onActivateQuestion(questionId)

    // Simulate a timer for the question
    setTimeRemaining(30)
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleEndQuestion = (questionId: string) => {
    setQuestions(
      questions.map((q) => ({
        ...q,
        status: q.id === questionId ? "ended" : q.status,
      })),
    )

    onActivateQuestion(null)
    setTimeRemaining(null)
  }

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return

    const newId = `q${questions.length + 1}`
    setQuestions([
      ...questions,
      {
        id: newId,
        text: newQuestion,
        type: "multiple-choice",
        options: [
          { id: `${newId}-o1`, text: "Option 1", correct: true },
          { id: `${newId}-o2`, text: "Option 2", correct: false },
          { id: `${newId}-o3`, text: "Option 3", correct: false },
          { id: `${newId}-o4`, text: "Option 4", correct: false },
        ],
        responses: [],
        status: "draft",
      },
    ])

    setNewQuestion("")
  }

  const getTotalResponses = (question: Question) => {
    return question.responses.reduce((sum, response) => sum + response.count, 0)
  }

  const getAccuracy = (question: Question) => {
    if (question.type !== "multiple-choice") return null

    const totalResponses = getTotalResponses(question)
    if (totalResponses === 0) return 0

    const correctOptionId = question.options.find((o) => o.correct)?.id
    if (!correctOptionId) return 0

    const correctResponses = question.responses.find((r) => r.optionId === correctOptionId)?.count || 0
    return Math.round((correctResponses / totalResponses) * 100)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Live Questions</h3>
        <div className="flex items-center gap-2">
          {timeRemaining !== null && (
            <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-md text-sm">
              <Clock className="h-4 w-4" />
              <span>{timeRemaining}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Question list */}
      <div className="space-y-3">
        {questions.map((question) => (
          <div
            key={question.id}
            className={cn(
              "border rounded-md p-3",
              question.status === "active" && "border-green-500 bg-green-50 dark:bg-green-900/10",
              question.status === "ended" && "opacity-70",
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{question.text}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="capitalize">{question.type}</span>
                  <span>•</span>
                  <span>{getTotalResponses(question)} responses</span>
                  {question.type === "multiple-choice" && (
                    <>
                      <span>•</span>
                      <span>Accuracy: {getAccuracy(question)}%</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {question.status === "draft" ? (
                  <Button
                    size="sm"
                    onClick={() => handleActivateQuestion(question.id)}
                    disabled={!isLive || activeQuestionId !== null}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                ) : question.status === "active" ? (
                  <Button size="sm" variant="outline" onClick={() => handleEndQuestion(question.id)}>
                    <X className="h-4 w-4 mr-1" />
                    End
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleActivateQuestion(question.id)}
                    disabled={!isLive || activeQuestionId !== null}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send Again
                  </Button>
                )}

                <Button size="sm" variant="ghost">
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Show responses for active or ended questions */}
            {(question.status === "active" || question.status === "ended") && (
              <div className="mt-3 space-y-2">
                {question.options.map((option) => {
                  const response = question.responses.find((r) => r.optionId === option.id)
                  const count = response?.count || 0
                  const total = getTotalResponses(question)
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {option.correct && <Check className="h-3 w-3 text-green-500" />}
                          <span>{option.text}</span>
                        </div>
                        <span>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new question */}
      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Type a new question..."
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddQuestion()
            }
          }}
        />
        <Button onClick={handleAddQuestion}>
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  )
}
