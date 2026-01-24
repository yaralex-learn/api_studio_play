"use client"

import { cn } from "@/lib/utils"
import { PieChart, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export function TrackingSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      name: "Overall",
      href: "/tracking/overall",
      icon: PieChart,
      active: pathname === "/tracking/overall",
    },
    {
      name: "Individual Tracking",
      href: "/tracking/individual",
      icon: User,
      active: pathname === "/tracking/individual",
    },
  ]

  return (
    <div className="w-64 border-r border-border">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Tracking Analytics</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
