"use client"

interface LiveHeaderProps {
  title: string
  instructor: {
    name: string
    avatar: string
  }
  viewerCount: number
  startTime: Date
  isLive: boolean
}

export function LiveHeader({ title, instructor, viewerCount, startTime, isLive }: LiveHeaderProps) {
  // Calculate session duration
  const getDuration = () => {
    const now = new Date()
    const diffMs = now.getTime() - startTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60

    return `${hours > 0 ? `${hours}h ` : ""}${mins}m`
  }

  return (
    <div className="border-b border-white/10 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          {/* Course title */}
          <h1 className="text-lg md:text-xl font-bold text-white truncate">{title}</h1>
          {/* Instructor name moved under title */}
          <p className="text-sm text-white/70">{instructor.name}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* All tags with same height and font size */}
          {/* Live tag moved to header */}
          {isLive && (
            <div className="flex items-center gap-1 bg-red-600 px-3 py-1.5 rounded-full text-white text-sm font-bold">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span>LIVE</span>
            </div>
          )}

          {/* Session duration */}
          <div className="bg-white/10 px-3 py-1.5 rounded-full text-white text-sm">{getDuration()}</div>

          {/* Viewer count */}
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/70"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-sm text-white">{viewerCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
