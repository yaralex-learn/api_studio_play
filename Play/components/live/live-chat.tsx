"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Smile, Send } from "lucide-react"

// Mock chat messages
const initialMessages = [
  {
    id: "msg1",
    user: {
      id: "user1",
      name: "Emma S.",
      avatar: "/elemental-bending.png",
      role: "student",
    },
    text: "Hello everyone! Excited for today's session.",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "msg2",
    user: {
      id: "instructor",
      name: "Prof. Maria Rodriguez",
      avatar: "/diverse-group-meeting.png",
      role: "instructor",
    },
    text: "Welcome everyone! We'll be practicing everyday conversations today.",
    timestamp: new Date(Date.now() - 14 * 60 * 1000),
  },
  {
    id: "msg3",
    user: {
      id: "user2",
      name: "Carlos M.",
      avatar: "/bioluminescent-forest.png",
      role: "student",
    },
    text: "I've been practicing the vocabulary from last week. Excited to use it in conversation!",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "msg4",
    user: {
      id: "user3",
      name: "Sophie L.",
      avatar: "/diverse-group-meeting.png",
      role: "student",
    },
    text: "Quick question - will we be covering restaurant conversations today?",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "msg5",
    user: {
      id: "instructor",
      name: "Prof. Maria Rodriguez",
      avatar: "/diverse-group-meeting.png",
      role: "instructor",
    },
    text: "Yes, Sophie! Restaurant conversations will be our second scenario today.",
    timestamp: new Date(Date.now() - 4 * 60 * 1000),
  },
]

// Mock typing users
const typingUsers = [
  {
    id: "user4",
    name: "Aiden T.",
  },
]

export function LiveChat() {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate new messages arriving
  useEffect(() => {
    const timer = setTimeout(() => {
      const newMsg = {
        id: `msg${messages.length + 1}`,
        user: {
          id: "user5",
          name: "Noah K.",
          avatar: "/blue-abstract-flow.png",
          role: "student",
        },
        text: "I've been practicing with a language exchange partner. It's really helping!",
        timestamp: new Date(),
      }
      setMessages([...messages, newMsg])
    }, 10000)

    return () => clearTimeout(timer)
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const userMessage = {
      id: `msg${messages.length + 1}`,
      user: {
        id: "currentUser",
        name: "Language Learner",
        avatar: "/abstract-user-icon.png",
        role: "student",
      },
      text: newMessage,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setNewMessage("")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full bg-[#131F24]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={message.user.avatar || "/placeholder.svg"}
                alt={message.user.name}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium ${message.user.role === "instructor" ? "text-yaralex-green" : "text-white"}`}
                >
                  {message.user.name}
                </span>
                <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
              </div>
              <p className="text-white/80 break-words">{message.text}</p>
            </div>
          </div>
        ))}

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "600ms" }}
              ></div>
            </div>
            <span>{typingUsers.map((u) => u.name).join(", ")} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 rounded-full hover:bg-white/10 text-white/70" aria-label="Add emoji">
            <Smile size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yaralex-green"
          />
          <button
            type="submit"
            className={`p-2 rounded-full ${newMessage.trim() ? "bg-yaralex-green text-black" : "bg-white/10 text-white/50"}`}
            disabled={!newMessage.trim()}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
