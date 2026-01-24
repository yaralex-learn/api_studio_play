import { MarketSidebar } from "@/components/market/market-sidebar"
import type { ReactNode } from "react"

export default function MarketLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container py-6 px-6 flex min-h-[calc(100vh-8.5rem)]">
      <MarketSidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
