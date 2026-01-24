import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-yaralex-background">
      <div className="absolute inset-0 bg-gradient-to-br from-yaralex-blue/10 via-transparent to-yaralex-purple/10" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
