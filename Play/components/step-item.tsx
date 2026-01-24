"use client"
import { cn } from "@/lib/utils"
import { RiFileListLine, RiQuestionLine } from "react-icons/ri"

interface StepItemProps {
  type: "lesson" | "quiz"
  color: string
  isActive?: boolean
  progress?: number
  className?: string
  onClick?: () => void
}

export function StepItem({ type, color, isActive = false, progress = 0, className, onClick }: StepItemProps) {
  const iconStyle = {
    size: 45,
    className: `fill-[${isActive ? color : "#4B4B4B"}]`,
  } as const

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center p-[1.2rem] pb-[1rem] border-4 border-b-8 rounded-3xl overflow-hidden",
        `cursor-${isActive ? "pointer" : "not-allowed"}`,
        className,
      )}
      style={{
        backgroundColor: "#1E2B31",
        borderColor: isActive ? color : "#4B4B4B",
      }}
      onClick={isActive ? onClick : undefined}
    >
      {/* Progress indicator */}
      {progress > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: color,
            opacity: 0.09,
            clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
          }}
        />
      )}

      {/* Inner content */}
      {type === "lesson" ? <RiFileListLine {...iconStyle} /> : <RiQuestionLine {...iconStyle} />}
    </div>
  )
}
