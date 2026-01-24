"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageBubble } from "./message-bubble"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ChevronLeft, Paperclip, Smile } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, isToday, isYesterday } from "date-fns"
import type { Channel, Message, Student } from "./types"

interface ChatAreaProps {
  channel: Channel | null
  student: Student | null
  students: Student[]
  onSendMessage: (content: string) => void
  onBackClick?: () => void
}

export function ChatArea({ channel, student, students, onSendMessage, onBackClick }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get the active conversation (either channel or student)
  const activeConversation = channel || student
  const messages = activeConversation?.messages || []

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when conversation changes
  useEffect(() => {
    if (activeConversation) {
      inputRef.current?.focus()
    }
  }, [activeConversation])

  const handleSendMessage = () => {
    if (newMessage.trim() && activeConversation) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Group messages by date
  const groupedMessages: { date: Date; messages: Message[] }[] = []
  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp)
    const dateString = format(messageDate, "yyyy-MM-dd")

    const existingGroup = groupedMessages.find((group) => format(group.date, "yyyy-MM-dd") === dateString)

    if (existingGroup) {
      existingGroup.messages.push(message)
    } else {
      groupedMessages.push({
        date: messageDate,
        messages: [message],
      })
    }
  })

  // Format date for display
  const formatDateHeading = (date: Date) => {
    if (isToday(date)) {
      return "Today"
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else {
      return format(date, "MMMM d, yyyy")
    }
  }

  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center text-muted-foreground">
        <div>
          <p className="mb-2">Select a channel or student to start chatting</p>
          <p className="text-sm">Your messages will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        {onBackClick && (
          <Button variant="ghost" size="icon" onClick={onBackClick} className="md:hidden">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        <Avatar className="h-10 w-10">
          <AvatarImage src={activeConversation.avatar || "/placeholder.svg"} alt={activeConversation.name} />
          <AvatarFallback>{activeConversation.name.substring(0, 2)}</AvatarFallback>
        </Avatar>

        <div>
          <h2 className="font-medium">{activeConversation.name}</h2>
          <p className="text-xs text-muted-foreground">{channel ? `${students.length} students` : "Student"}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-muted-foreground">
            <div>
              <p className="mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <div className="flex justify-center">
                <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                  {formatDateHeading(group.date)}
                </div>
              </div>

              {group.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isFromCurrentUser={message.sender.id === "instructor"}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Paperclip className="h-5 w-5" />
        </Button>

        <Input
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="flex-1"
        />

        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Smile className="h-5 w-5" />
        </Button>

        <Button onClick={handleSendMessage} disabled={!newMessage.trim()} size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
