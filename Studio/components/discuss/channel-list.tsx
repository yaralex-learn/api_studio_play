"use client"
import type { Channel } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface ChannelListProps {
  channels: Channel[]
  selectedChannel: Channel | null
  onSelectChannel: (channel: Channel) => void
}

export function ChannelList({ channels, selectedChannel, onSelectChannel }: ChannelListProps) {
  // Remove the searchQuery state and filtering logic

  return (
    <div className="flex flex-col">
      {/* Remove the search bar */}

      {/* Channel list */}
      <div className="overflow-y-auto">
        {channels.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No channels found</div>
        ) : (
          <ul>
            {channels.map((channel) => (
              <li key={channel.id}>
                <button
                  className={cn(
                    "w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors",
                    selectedChannel?.id === channel.id && "bg-accent",
                  )}
                  onClick={() => onSelectChannel(channel)}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={channel.avatar || "/placeholder.svg"} alt={channel.name} />
                    <AvatarFallback>{channel.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {channel.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                          {channel.unreadCount}
                        </span>
                      )}
                      <h3 className="font-medium truncate">{channel.name}</h3>
                    </div>

                    <div className="flex flex-col">
                      {channel.lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {channel.lastMessage.sender.id === "instructor" ? "You: " : ""}
                          {channel.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No messages yet</p>
                      )}

                      {channel.lastMessage && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(channel.lastMessage.timestamp), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
