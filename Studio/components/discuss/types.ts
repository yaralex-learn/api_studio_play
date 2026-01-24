export interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date
  status: "sent" | "delivered" | "read"
}

export interface Channel {
  id: string
  name: string
  avatar?: string
  description?: string
  messages: Message[]
  lastMessage?: Message
  unreadCount: number
}

export interface Student {
  id: string
  name: string
  avatar?: string
  email?: string
  messages: Message[]
  lastMessage?: Message
  unreadCount: number
  status?: "online" | "offline" | "away"
}
