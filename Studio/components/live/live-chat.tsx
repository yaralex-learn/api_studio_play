"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, ThumbsUp, Flag, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  sender: {
    name: string
    avatar: string
    role: "instructor" | "student"
  }
  text: string
  timestamp: Date
  likes: number
  isLiked: boolean
  isFlagged: boolean
}

interface LiveChatProps {
  isLive: boolean
}

export function LiveChat({ isLive }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: {
        name: "Instructor",
        avatar: "I",
        role: "instructor",
      },
      text: "Welcome to the live session! Feel free to ask questions.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      likes: 3,
      isLiked: false,
      isFlagged: false,
    },
    {
      id: "m2",
      sender: {
        name: "Alex Johnson",
        avatar: "AJ",
        role: "student",
      },
      text: "Thanks! Could you explain the concept from slide 15 again?",
      timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
      likes: 2,
      isLiked: false,
      isFlagged: false,
    },
    {
      id: "m3",
      sender: {
        name: "Instructor",
        avatar: "I",
        role: "instructor",
      },
      text: "Sure, Alex! The key point is that we need to consider both factors when analyzing the results.",
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      likes: 5,
      isLiked: true,
      isFlagged: false,
    },
    {
      id: "m4",
      sender: {
        name: "Sarah Lee",
        avatar: "SL",
        role: "student",
      },
      text: "I'm having trouble with the second exercise. Can you help?",
      timestamp: new Date(Date.now() - 1000 * 30), // 30 seconds ago
      likes: 0,
      isLiked: false,
      isFlagged: false,
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [activeParticipants, setActiveParticipants] = useState(24)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const newMsg: Message = {
      id: `m${messages.length + 1}`,
      sender: {
        name: "Instructor",
        avatar: "I",
        role: "instructor",
      },
      text: newMessage,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      isFlagged: false,
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  const handleLikeMessage = (messageId: string) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const wasLiked = msg.isLiked
          return {
            ...msg,
            likes: wasLiked ? msg.likes - 1 : msg.likes + 1,
            isLiked: !wasLiked,
          }
        }
        return msg
      }),
    )
  }

  const handleFlagMessage = (messageId: string) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            isFlagged: !msg.isFlagged,
          }
        }
        return msg
      }),
    )
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Live Chat</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="h-2 w-2 bg-green-500 rounded-full"></span>
            {activeParticipants} Online
          </Badge>
        </div>
      </CardHeader>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col">
          <CardContent className="flex-1 overflow-y-auto max-h-[500px] py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.isFlagged ? "opacity-50" : ""}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={message.sender.role === "instructor" ? "bg-blue-100 text-blue-800" : ""}>
                      {message.sender.avatar}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {message.sender.name}
                        {message.sender.role === "instructor" && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Instructor
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                    </div>

                    <p className="text-sm">{message.text}</p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleLikeMessage(message.id)}
                      >
                        <ThumbsUp className={`h-3 w-3 mr-1 ${message.isLiked ? "fill-current" : ""}`} />
                        {message.likes > 0 && message.likes}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleFlagMessage(message.id)}
                      >
                        <Flag className={`h-3 w-3 ${message.isFlagged ? "fill-current text-red-500" : ""}`} />
                      </Button>

                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <CardFooter className="border-t pt-4">
            <div className="flex w-full gap-2">
              <Input
                placeholder={isLive ? "Type a message..." : "Live session not started"}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage()
                  }
                }}
                disabled={!isLive}
              />
              <Button onClick={handleSendMessage} disabled={!isLive || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </TabsContent>

        <TabsContent value="participants" className="flex-1">
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-800">I</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">Instructor</span>
                  <Badge variant="secondary">You</Badge>
                </div>
              </div>

              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{`S${i + 1}`}</AvatarFallback>
                    </Avatar>
                    <span>Student {i + 1}</span>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    {i % 2 === 0 ? "Active" : "Away"}
                  </Badge>
                </div>
              ))}

              <div className="pt-2 text-center text-sm text-muted-foreground">+ 19 more participants</div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
