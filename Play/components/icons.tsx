import type { SVGProps } from "react"

export function LearnIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="40" height="40" rx="8" fill="#FF9600" />
      <path d="M20 10L32 18V30H26V22H14V30H8V18L20 10Z" fill="#FFD900" />
      <path d="M20 13L30 19V27H24V19H16V27H10V19L20 13Z" fill="#FF4B4B" />
    </svg>
  )
}

export function PracticeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="40" height="40" rx="8" fill="#1CB0F6" />
      <path d="M20 8L32 14V26L20 32L8 26V14L20 8Z" fill="#84D8FF" />
      <path d="M19 16L16 19L19 22L24 17L27 20L19 28L13 22L16 19L19 16Z" fill="#0076C5" />
    </svg>
  )
}

export function FlashcardsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="40" height="40" rx="8" fill="#FF9600" />
      <rect x="8" y="10" width="16" height="20" rx="2" fill="#FFD900" />
      <rect x="16" y="10" width="16" height="20" rx="2" fill="#FFAA00" />
      <rect x="24" y="10" width="8" height="20" rx="2" fill="#FF4B4B" />
    </svg>
  )
}

export function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="40" height="40" rx="8" fill="#A560E8" />
      <circle cx="20" cy="20" r="12" fill="#CE82FF" stroke="#7E00C5" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="20" cy="16" r="5" fill="#7E00C5" />
      <path d="M12 28C14 24 16 22 20 22C24 22 26 24 28 28" stroke="#7E00C5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function YaralexLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="40" height="40" rx="8" fill="#58CC02" />
      <path d="M20 8L32 14V26L20 32L8 26V14L20 8Z" fill="#89E219" />
      <path d="M20 12L28 16V24L20 28L12 24V16L20 12Z" fill="#58CC02" />
      <path d="M20 16L24 18V22L20 24L16 22V18L20 16Z" fill="#89E219" />
    </svg>
  )
}
