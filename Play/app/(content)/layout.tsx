import type React from "react"
import { FloatingChatButton } from "@/components/floating-chat-button"

export default function ContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-yaralex-background">
      {children}
      <FloatingChatButton />
    </div>
  )
}
