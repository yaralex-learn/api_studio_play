"use client"

import { format } from "date-fns"
import { Check, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MessageBubbleProps {
  message: Message
  isFromCurrentUser: boolean
}

export function MessageBubble({ message, isFromCurrentUser }: MessageBubbleProps) {
  // Format time for display
  const formattedTime = format(new Date(message.timestamp), "h:mm a")

  return (
    <div className={cn("flex items-end gap-2", isFromCurrentUser ? "justify-end" : "justify-start")}>
      {/* Show avatar only for messages not from current user */}
      {!isFromCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[80%] md:max-w-[60%] rounded-lg px-4 py-2 flex flex-col",
          isFromCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none",
        )}
      >
        <div className="break-words">{message.content}</div>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">{formattedTime}</span>

          {isFromCurrentUser && (
            <span className="text-xs">
              {message.status === "read" ? (
                <CheckCheck className="h-3 w-3" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Show avatar only for messages from current user */}
      {isFromCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
