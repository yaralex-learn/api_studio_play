"use client"

export interface SectionItemProps {
  id: number
  title: string
  description: string
  level: string
  difficulty: "Easy" | "Medium" | "Hard" | "Expert"
  progress: number
  completedSteps: number
  totalSteps: number
  isActive: boolean
  color: string
  onClick?: () => void
}

export function SectionItem({
  id,
  title,
  description,
  level,
  difficulty,
  progress,
  completedSteps,
  totalSteps,
  isActive,
  color,
  onClick,
}: SectionItemProps) {
  // Map difficulty to colors
  const difficultyColors = {
    Easy: "bg-green-500",
    Medium: "bg-yellow-500",
    Hard: "bg-orange-500",
    Expert: "bg-red-500",
  }

  return (
    <div className="mb-6 rounded-xl bg-[#1E2B31] p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${difficultyColors[difficulty]} px-2 py-0.5 rounded-md text-black`}>
              {difficulty}
            </span>
            <span className="text-[#4B94C1] font-bold">•</span>
            <span className="text-[#4B94C1] font-bold">{level}</span>
          </div>
          <h2 className={`mt-2 text-2xl font-bold ${isActive ? "text-white" : "text-gray-400"}`}>{title}</h2>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {/* Progress or units */}
      <div className="mb-4 mt-4">
        {isActive ? (
          <div className="flex flex-row gap-3 items-center">
            <div className="h-[6px] w-full rounded-full bg-[#2B3B45]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(completedSteps / totalSteps) * 100}%`,
                  backgroundColor: color,
                }}
              ></div>
            </div>
            <div className="flex justify-end">
              <span className="text-sm font-medium text-gray-400 text-nowrap">
                {completedSteps}/{totalSteps} UNITS
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-400">{totalSteps} UNITS</span>
          </div>
        )}
      </div>

      {/* Button */}
      <div className="flex items-end justify-between">
        {isActive ? (
          <button
            onClick={onClick}
            className="w-full rounded-xl py-3 text-center text-sm font-bold text-black hover:bg-opacity-90"
            style={{ backgroundColor: color }}
          >
            CONTINUE
          </button>
        ) : (
          <button
            onClick={onClick}
            className="w-full rounded-xl border py-3 text-center text-sm font-bold hover:bg-opacity-10"
            style={{ borderColor: color, color: color }}
          >
            JUMP TO SECTION {id}
          </button>
        )}
      </div>
    </div>
  )
}
