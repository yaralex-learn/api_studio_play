"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "text" }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return variant === "icon" ? (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <span className="h-5 w-5" />
      </Button>
    ) : (
      <span>Loading...</span>
    )
  }

  const isDark = resolvedTheme === "dark"

  if (variant === "text") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex items-center justify-between w-full"
      >
        {isDark ? "Light Mode" : "Dark Mode"}
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")} className="h-9 w-9">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
