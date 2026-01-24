interface CircularProgressBarProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  text?: string
}

export function CircularProgressBar({
  progress,
  size = 60,
  strokeWidth = 6,
  color = "#58CC02",
  bgColor = "#1E2B31",
  text,
}: CircularProgressBarProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="#4b4b4b" strokeWidth={strokeWidth} />

        {/* Progress circle */}
        {progress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}

        {/* Progress text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={size / 4}
          fontWeight="bold"
        >
          {text || `${Math.round(progress)}%`}
        </text>
      </svg>
    </div>
  )
}
