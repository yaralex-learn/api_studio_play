import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Learn - Yaralex Play",
  description: "Learn languages the fun way",
}

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div>{children}</div>
}
