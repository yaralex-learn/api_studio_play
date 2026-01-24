import { TrackingSidebar } from "@/components/tracking/tracking-sidebar"
import type { ReactNode } from "react"

export default function TrackingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container py-6 px-6 flex min-h-[calc(100vh-8.5rem)]">
      <TrackingSidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
