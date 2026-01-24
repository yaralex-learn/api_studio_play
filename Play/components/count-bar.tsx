import { cn } from "@/lib/utils"

interface CountBarProps {
  completed: number
  total: number
  color?: string
  className?: string
}

export function CountBar({ completed, total, color = "#58CC02", className }: CountBarProps) {
  const percentage = Math.min(100, Math.max(0, (completed / total) * 100))

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium text-white/70 whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  )
}
