"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

// Mock questions data
const questionsData = [
  {
    id: "q1",
    question: "What is the Spanish word for 'hello'?",
    status: "answered",
    correctAnswer: "Hola",
    yourAnswer: "Hola",
    isCorrect: true,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "q2",
    question: "How do you say 'thank you' in Spanish?",
    status: "answered",
    correctAnswer: "Gracias",
    yourAnswer: "Gracias",
    isCorrect: true,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "q3",
    question: "What is the Spanish word for 'goodbye'?",
    status: "answered",
    correctAnswer: "Adiós",
    yourAnswer: "Hasta luego",
    isCorrect: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "q4",
    status: "active",
    question: "What is the Spanish word for 'please'?",
    options: ["Por favor", "Gracias", "De nada", "Perdón"],
    correctAnswer: "Por favor",
    timestamp: new Date(),
  },
]

export function QuestionsSidebar() {
  const [expandedSections, setExpandedSections] = useState({
    active: true,
    previous: true,
  })

  const activeQuestions = questionsData.filter((q) => q.status === "active")
  const previousQuestions = questionsData.filter((q) => q.status === "answered")

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full bg-[#131F24]">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">Questions</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Active Questions Section */}
        <div>
          <button
            onClick={() => toggleSection("active")}
            className="flex items-center justify-between w-full p-3 text-white hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">Active Questions</span>
              <span className="text-sm text-gray-400">({activeQuestions.length})</span>
            </div>
            {expandedSections.active ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedSections.active && (
            <div className="space-y-3 p-3">
              {activeQuestions.map((question) => (
                <div key={question.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-yaralex-green font-medium">ACTIVE</span>
                    <span className="text-xs text-gray-400">{formatTime(question.timestamp)}</span>
                  </div>
                  <p className="text-white text-sm mb-2">{question.question}</p>
                  <div className="text-xs text-white/60">Waiting for your answer...</div>
                </div>
              ))}
              {activeQuestions.length === 0 && (
                <div className="text-center text-white/60 py-4">No active questions</div>
              )}
            </div>
          )}
        </div>

        {/* Previous Questions Section */}
        <div>
          <button
            onClick={() => toggleSection("previous")}
            className="flex items-center justify-between w-full p-3 text-white hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">Previous Questions</span>
              <span className="text-sm text-gray-400">({previousQuestions.length})</span>
            </div>
            {expandedSections.previous ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedSections.previous && (
            <div className="space-y-3 p-3">
              {previousQuestions.map((question) => (
                <div
                  key={question.id}
                  className={`bg-white/5 rounded-lg p-3 border-l-4 ${
                    question.isCorrect ? "border-yaralex-green" : "border-red-500"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-xs font-medium ${question.isCorrect ? "text-yaralex-green" : "text-red-500"}`}
                    >
                      {question.isCorrect ? "CORRECT" : "INCORRECT"}
                    </span>
                    <span className="text-xs text-gray-400">{formatTime(question.timestamp)}</span>
                  </div>
                  <p className="text-white text-sm mb-2">{question.question}</p>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="text-white/60">
                      Your answer: <span className="text-white">{question.yourAnswer}</span>
                    </div>
                    {!question.isCorrect && (
                      <div className="text-white/60">
                        Correct answer: <span className="text-yaralex-green">{question.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {previousQuestions.length === 0 && (
                <div className="text-center text-white/60 py-4">No previous questions</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
