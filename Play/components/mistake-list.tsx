import { cn } from "@/lib/utils"

interface Mistake {
  id: string
  text: string
  correction: string
  date: string
}

interface MistakeListProps {
  mistakes: Mistake[]
  className?: string
}

export function MistakeList({ mistakes, className }: MistakeListProps) {
  if (mistakes.length === 0) {
    return <div className={cn("text-center py-2 text-white/50 text-sm", className)}>No recent mistakes. Great job!</div>
  }

  return (
    <div className={cn("space-y-2", className)}>
      {mistakes.map((mistake) => (
        <div key={mistake.id} className="rounded-md bg-white/5 p-2">
          <div className="flex items-start gap-2">
            <div className="mt-1 h-4 w-4 rounded-full bg-red-500/20 flex-shrink-0">
              <span className="sr-only">Mistake</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70 line-through">{mistake.text}</p>
              <p className="text-sm text-yaralex-green">{mistake.correction}</p>
              <p className="text-xs text-white/50 mt-1">{mistake.date}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
