"use client"

import { cn } from "@/lib/utils"
import { BarChart3, DollarSign, Users } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export function MarketSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      name: "Subscription Overview",
      href: "/market",
      icon: BarChart3,
      active: pathname === "/market",
    },
    {
      name: "Subscribers",
      href: "/market/subscribers",
      icon: Users,
      active: pathname === "/market/subscribers",
    },
    {
      name: "Revenue",
      href: "/market/revenue",
      icon: DollarSign,
      active: pathname === "/market/revenue",
    },
  ]

  return (
    <div className="w-64 border-r border-border">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Market Analytics</h2>
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
