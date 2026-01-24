"use client"

import { useState, useEffect } from "react"
import { VideoPlayer } from "@/components/live/video-player"
import { LiveChat } from "@/components/live/live-chat"
import { ParticipantList } from "@/components/live/participant-list"
import { QuestionModule } from "@/components/live/question-module"
import { QuestionsSidebar } from "@/components/live/questions-sidebar"
import { LiveHeader } from "@/components/live/live-header"
import { LiveFooter } from "@/components/live/live-footer"
import { WaitingRoom } from "@/components/live/waiting-room"
import { useMediaQuery } from "@/hooks/use-media-query"

// Mock session data
const sessionData = {
  id: "live-session-123",
  title: "Spanish Conversation Practice: Everyday Situations",
  instructor: {
    name: "Prof. Maria Rodriguez",
    avatar: "/diverse-group-meeting.png",
  },
  startTime: new Date(Date.now() - 25 * 60 * 1000), // Started 25 minutes ago
  isLive: true,
  viewerCount: 42,
  description: "Practice everyday Spanish conversations with real-world examples and interactive exercises.",
}

export default function LivePage() {
  const [isSessionStarted, setIsSessionStarted] = useState(sessionData.isLive)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showQuestions, setShowQuestions] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)

  const isMobileView = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    setIsMobile(isMobileView)
  }, [isMobileView])

  // Simulate a question appearing after 5 seconds
  useEffect(() => {
    if (isSessionStarted) {
      const timer = setTimeout(() => {
        setActiveQuestion({
          id: "q1",
          type: "multiple-choice",
          question: "What is the Spanish word for 'hello'?",
          options: ["Hola", "Adiós", "Gracias", "Por favor"],
          correctAnswer: "Hola",
          timeLimit: 10,
          explanation: "Hola is the standard greeting in Spanish, used to say hello.",
        })
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isSessionStarted])

  const handleAnswerSubmit = (answer: string | null) => {
    // In a real app, this would send the answer to the server
    console.log("Answer submitted:", answer)

    // Update the question with the result
    setActiveQuestion((prev: any) => ({
      ...prev,
      userAnswer: answer || "No answer", // Handle the case when no answer was selected
      isCorrect: answer === prev.correctAnswer,
      classPerformance: {
        correct: 78,
        incorrect: 22,
      },
      showExplanation: true,
    }))
  }

  const handleCloseQuestion = () => {
    setActiveQuestion(null)
  }

  const toggleChat = () => {
    if (showChat) {
      setShowChat(false)
    } else {
      setShowChat(true)
      setShowParticipants(false)
      setShowQuestions(false)
    }
  }

  const toggleParticipants = () => {
    if (showParticipants) {
      setShowParticipants(false)
    } else {
      setShowParticipants(true)
      setShowChat(false)
      setShowQuestions(false)
    }
  }

  const toggleQuestions = () => {
    if (showQuestions) {
      setShowQuestions(false)
    } else {
      setShowQuestions(true)
      setShowChat(false)
      setShowParticipants(false)
    }
  }

  if (!isSessionStarted) {
    return <WaitingRoom session={sessionData} onSessionStart={() => setIsSessionStarted(true)} />
  }

  return (
    <div className="flex flex-col h-screen bg-yaralex-background">
      {/* Header */}
      <LiveHeader
        title={sessionData.title}
        instructor={sessionData.instructor}
        viewerCount={sessionData.viewerCount}
        startTime={sessionData.startTime}
        isLive={sessionData.isLive}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content (video player) */}
        <div className={`flex-1 relative`}>
          <VideoPlayer />

          {/* Question overlay */}
          {activeQuestion && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
              <QuestionModule question={activeQuestion} onSubmit={handleAnswerSubmit} onClose={handleCloseQuestion} />
            </div>
          )}
        </div>

        {/* Sidebar (chat, questions, and participants) */}
        {(showChat || showParticipants || showQuestions) && (
          <div
            className={`${isMobile ? "absolute inset-0 z-20 bg-yaralex-background" : "w-80 border-l border-white/10"} flex flex-col`}
          >
            {isMobile && (
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">
                  {showChat ? "Live Chat" : showQuestions ? "Questions" : "Participants"}
                </h2>
                <button
                  onClick={() => {
                    if (showChat) setShowChat(false)
                    else if (showQuestions) setShowQuestions(false)
                    else setShowParticipants(false)
                  }}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}

            <div className="flex-1 overflow-hidden">
              {showChat && <LiveChat />}
              {showParticipants && <ParticipantList />}
              {showQuestions && <QuestionsSidebar />}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <LiveFooter
        showChat={showChat}
        showParticipants={showParticipants}
        showQuestions={showQuestions}
        toggleChat={toggleChat}
        toggleParticipants={toggleParticipants}
        toggleQuestions={toggleQuestions}
      />
    </div>
  )
}
