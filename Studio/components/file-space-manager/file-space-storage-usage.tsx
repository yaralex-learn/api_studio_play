"use client";

interface StorageUsageProps {
  used: number;
  total: number;
  size?: number;
}

export default function FileSpaceStorageUsage({
  used,
  total,
  size = 12,
}: StorageUsageProps) {
  // Calculate percentage
  const percentage = Math.min(used / total, 1);
  const strokeWidth = 6;

  // Calculate SVG parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - percentage);

  // Get color based on percentage
  const color = getColorForPercentage(percentage);

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* Percentage text */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(size * 0.2, 9), // Reduced from 0.25 to 0.2 to make it smaller
          fontWeight: "900", // Increased from "bold" to "900" to make it thicker
        }}
      >
        {Math.round(percentage * 100)}%
      </div>
    </div>
  );
}

// Helper function to get color based on percentage
function getColorForPercentage(percentage: number): string {
  if (percentage < 0.6) return "#22c55e"; // Green
  if (percentage < 0.8) return "#eab308"; // Yellow
  return "#ef4444"; // Red
}
