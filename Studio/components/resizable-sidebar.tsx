"use client"

import type React from "react"

import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

interface ResizableSidebarProps {
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  className?: string
  headerContent?: React.ReactNode
  children?: React.ReactNode
}

export function ResizableSidebar({
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 500,
  className,
  headerContent,
  children,
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(defaultWidth)

  // Handle mouse down on the resize handle
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
  }

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - startXRef.current
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, minWidth, maxWidth])

  return (
    <div
      ref={sidebarRef}
      className={cn("flex h-screen sticky top-0 z-10", isResizing && "select-none", className)}
      style={{ width: `${width}px` }}
    >
      <SidebarProvider>
        <Sidebar className="w-full">
          {headerContent && <SidebarHeader className="p-0">{headerContent}</SidebarHeader>}
          <SidebarContent className="overflow-y-auto">{children}</SidebarContent>
        </Sidebar>
      </SidebarProvider>

      {/* Resize handle */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-1 cursor-ew-resize",
          "dark:hover:bg-gray-600 hover:bg-gray-300",
          "dark:active:bg-gray-500 active:bg-gray-400",
          isResizing && "dark:bg-gray-500 bg-gray-400",
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}
