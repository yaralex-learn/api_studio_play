"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface QuestionProps {
  question: {
    id: string
    type: string
    question: string
    options?: string[]
    correctAnswer: string
    timeLimit?: number
    explanation?: string
    userAnswer?: string
    isCorrect?: boolean
    classPerformance?: {
      correct: number
      incorrect: number
    }
    showExplanation?: boolean
  }
  onSubmit: (answer: string | null) => void
  onClose: () => void
}

export function QuestionModule({ question, onSubmit, onClose }: QuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(question.timeLimit || 30)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timePercentage, setTimePercentage] = useState(100)
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !isTimeUp && !question.userAnswer) {
      const timer = setTimeout(() => {
        const newTimeRemaining = timeRemaining - 0.1
        setTimeRemaining(newTimeRemaining)

        // Update time percentage for the progress bar
        const percentage = (newTimeRemaining / (question.timeLimit || 30)) * 100
        setTimePercentage(percentage)

        if (newTimeRemaining <= 0) {
          setIsTimeUp(true)
          // Show results if an answer was submitted
          if (isSubmitted) {
            setShowResult(true)
            onSubmit(submittedAnswer)
          } else {
            // Auto-submit with no answer when time is up
            handleTimeUp()
          }
        }
      }, 100) // Update every 100ms for smoother animation

      return () => clearTimeout(timer)
    }
  }, [timeRemaining, isSubmitted, question.userAnswer, isTimeUp, question.timeLimit, submittedAnswer, onSubmit])

  const handleTimeUp = () => {
    // When time is up, submit the current selected answer (or null if nothing selected)
    setIsSubmitted(true)
    setShowResult(true)
    onSubmit(selectedAnswer)
  }

  const handleSubmit = () => {
    if (!selectedAnswer || isTimeUp) return

    setIsSubmitted(true)
    setSubmittedAnswer(selectedAnswer)
    // Don't call onSubmit here - wait for timer to expire
  }

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (timePercentage >= 70) return "bg-yaralex-green"
    if (timePercentage >= 30) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-[#1E2B31] rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl"
    >
      {/* Question header with timer */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Question</h3>

        {!question.userAnswer && !isSubmitted && (
          <div className="flex items-center gap-3">
            {/* Timer progress bar - similar to quiz page */}
            <div className="relative h-7 w-40 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-100 ${getTimerColor()}`}
                style={{ width: `${timePercentage}%`, opacity: isTimeUp ? 0 : 1 }}
              ></div>
              {/* Time remaining text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-bold text-white z-10 ${isTimeUp ? "text-red-500" : ""}`}>
                  {isTimeUp
                    ? "Time's up!"
                    : `${Math.ceil(timeRemaining)} ${Math.ceil(timeRemaining) === 1 ? "Second" : "Seconds"}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question text */}
      <p className="text-white text-lg mb-6">{question.question}</p>

      {/* Options */}
      {question.type === "multiple-choice" && question.options && (
        <div className="space-y-3">
          {question.options.map((option) => {
            // Determine button styling based on state
            let buttonStyle = "border-white/20 text-white hover:border-white/40"

            if (question.userAnswer) {
              if (option === question.correctAnswer) {
                buttonStyle = "border-yaralex-green bg-yaralex-green/20 text-white"
              } else if (option === question.userAnswer && option !== question.correctAnswer) {
                buttonStyle = "border-red-500 bg-red-500/20 text-white"
              }
            } else if (selectedAnswer === option) {
              buttonStyle = "border-yaralex-blue bg-yaralex-blue/20 text-white"
            }

            return (
              <button
                key={option}
                className={`w-full rounded-lg border-2 p-3 text-left transition-all ${buttonStyle}`}
                onClick={() => !isSubmitted && !isTimeUp && setSelectedAnswer(option)}
                disabled={isSubmitted || isTimeUp || !!question.userAnswer}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}

      {/* Time's up message */}
      {isTimeUp && !showResult && !question.userAnswer && (
        <div className="mt-6 p-4 rounded-lg bg-red-500/20">
          <p className="font-bold text-red-500">Time's up!</p>
          <p className="text-white/80 mt-2">You didn't submit an answer in time.</p>
        </div>
      )}

      {/* Waiting for results message */}
      {isSubmitted && !showResult && !question.userAnswer && (
        <div className="mt-6">
          <div className="p-4 rounded-lg bg-yaralex-blue/20">
            <div className="flex items-center justify-between">
              <p className="font-bold text-yaralex-blue">Answer submitted</p>
              <span className="text-white font-medium">{Math.ceil(timeRemaining)}s</span>
            </div>

            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-yaralex-blue rounded-full transition-all duration-100"
                style={{ width: `${timePercentage}%` }}
              ></div>
            </div>

            <p className="text-white/80 mt-3">
              Your answer has been recorded. Results will be shown when the timer expires.
            </p>
          </div>
        </div>
      )}

      {/* Submit button - only show if not yet submitted and time is not up */}
      {!question.userAnswer && !isSubmitted && !isTimeUp && (
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className={`w-full py-3 rounded-lg font-bold ${
              selectedAnswer
                ? "bg-yaralex-green text-black hover:bg-yaralex-green/90"
                : "bg-white/20 text-white/50 cursor-not-allowed"
            }`}
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* Feedback after answering */}
      {question.userAnswer && (
        <div className="mt-6">
          <div className={`p-4 rounded-lg ${question.isCorrect ? "bg-yaralex-green/20" : "bg-red-500/20"}`}>
            <p className={`font-bold ${question.isCorrect ? "text-yaralex-green" : "text-red-500"}`}>
              {question.isCorrect ? "Correct!" : "Incorrect"}
            </p>

            {question.showExplanation && question.explanation && (
              <p className="text-white/80 mt-2">{question.explanation}</p>
            )}
          </div>

          {/* Class performance */}
          {question.classPerformance && (
            <div className="mt-4">
              <p className="text-white/70 text-sm mb-2">Class Performance</p>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yaralex-green rounded-full"
                  style={{ width: `${question.classPerformance.correct}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-white/60">
                <span>{question.classPerformance.correct}% correct</span>
                <span>{question.classPerformance.incorrect}% incorrect</span>
              </div>
            </div>
          )}

          {/* Close button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg font-bold bg-white/10 text-white hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
