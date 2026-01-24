"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageCircle, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"

// Chat types
type ChatType = "ai" | "teacher" | "group"

// Mock data for chats
const mockChats = {
  ai: [
    { id: 1, sender: "ai", message: "Hello! How can I help you with your language learning today?", time: "10:30 AM" },
  ],
  teacher: [
    {
      id: 1,
      sender: "teacher",
      name: "Prof. Maria Rodriguez",
      avatar: "/diverse-group-meeting.png",
      message: "Hi there! Do you have any questions about today's lesson?",
      time: "11:15 AM",
    },
  ],
  group: [
    {
      id: 1,
      sender: "other",
      name: "Emma S.",
      avatar: "/elemental-bending.png",
      message: "Has anyone started the homework for Unit 3?",
      time: "09:45 AM",
    },
    {
      id: 2,
      sender: "other",
      name: "Carlos M.",
      avatar: "/bioluminescent-forest.png",
      message: "Yes, I'm working on it now. The grammar exercises are challenging!",
      time: "09:48 AM",
    },
  ],
}

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [chatType, setChatType] = useState<ChatType>("ai")
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const pathname = usePathname()

  // Check if we should show the button (exclude QuizPage)
  const shouldShow = !pathname.includes("/quiz/")

  // Set initial messages based on chat type
  useEffect(() => {
    setMessages(mockChats[chatType])
  }, [chatType])

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      name: "You",
      avatar: "/abstract-user-icon.png",
      message: inputValue,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")

    // Simulate response after a delay
    setTimeout(() => {
      let responseMessage

      if (chatType === "ai") {
        responseMessage = {
          id: newMessages.length + 1,
          sender: "ai",
          message: "I understand. Let me help you with that!",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      } else if (chatType === "teacher") {
        responseMessage = {
          id: newMessages.length + 1,
          sender: "teacher",
          name: "Prof. Maria Rodriguez",
          avatar: "/diverse-group-meeting.png",
          message: "Great question! Let me explain that concept...",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      } else {
        // For group chat, no automatic response
        return
      }

      setMessages([...newMessages, responseMessage])
    }, 1000)
  }

  // Get chat title based on type
  const getChatTitle = () => {
    switch (chatType) {
      case "ai":
        return "AI Assistant"
      case "teacher":
        return "Chat with Teacher"
      case "group":
        return "Student Group Chat"
    }
  }

  if (!shouldShow) return null

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-yaralex-green shadow-lg transition-all hover:bg-yaralex-green/90",
          isOpen && "opacity-0 pointer-events-none",
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6 text-black" />
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col w-96 sm:w-[450px] h-[600px] rounded-xl bg-[#1E2B31] shadow-xl overflow-hidden border border-white/10"
          >
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#131F24]">
              <h3 className="font-bold text-white">{getChatTitle()}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/10"
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Chat type selector tabs - always visible */}
            <div className="flex p-2 gap-2 bg-[#131F24]/50 border-b border-white/10">
              <button
                onClick={() => setChatType("ai")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                  chatType === "ai" ? "bg-yaralex-green text-black" : "text-white hover:bg-white/10",
                )}
              >
                AI Assistant
              </button>
              <button
                onClick={() => setChatType("teacher")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                  chatType === "teacher" ? "bg-yaralex-green text-black" : "text-white hover:bg-white/10",
                )}
              >
                Teacher
              </button>
              <button
                onClick={() => setChatType("group")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                  chatType === "group" ? "bg-yaralex-green text-black" : "text-white hover:bg-white/10",
                )}
              >
                Group
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.sender === "user" ? "flex-row-reverse" : "flex-row")}>
                  {/* Avatar */}
                  {msg.sender !== "ai" && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={msg.avatar || "/placeholder.svg"}
                        alt={msg.name || "Avatar"}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Message content */}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[75%]",
                      msg.sender === "user"
                        ? "bg-yaralex-green text-black"
                        : msg.sender === "ai"
                          ? "bg-yaralex-blue text-white"
                          : "bg-white/10 text-white",
                    )}
                  >
                    {msg.sender !== "user" && msg.sender !== "ai" && (
                      <div className="text-xs font-medium text-white/70 mb-1">{msg.name}</div>
                    )}
                    <p className="break-words">{msg.message}</p>
                    <div className={cn("text-xs mt-1", msg.sender === "user" ? "text-black/70" : "text-white/70")}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yaralex-green"
                />
                <button
                  type="submit"
                  className={cn(
                    "p-2 rounded-full",
                    inputValue.trim()
                      ? "bg-yaralex-green text-black hover:bg-yaralex-green/90"
                      : "bg-white/10 text-white/50 cursor-not-allowed",
                  )}
                  disabled={!inputValue.trim()}
                  aria-label="Send message"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
