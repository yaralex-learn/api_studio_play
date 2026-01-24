"use client"

import Link from "next/link"
import Image from "next/image"
import { BackIcon } from "@/components/learn-icons"

interface LearnHeaderProps {
  sectionTitle?: string
  backUrl?: string
}

export function LearnHeader({ sectionTitle, backUrl = "/channels" }: LearnHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex h-16 items-center justify-between bg-yaralex-background px-4">
      {/* Back button and section title on the left */}
      <div className="flex items-center gap-3">
        <Link
          href={backUrl}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <BackIcon className="h-6 w-6 text-white" />
        </Link>

        {sectionTitle && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-1.5 rounded-full shadow-lg shadow-yellow-400/30 border border-yellow-300">
            <h2 className="font-bold text-black">{sectionTitle}</h2>
          </div>
        )}
      </div>

      {/* Language flag, XP and hearts on the right */}
      <div className="flex items-center gap-4">
        {/* Spanish flag */}
        <div className="flex h-10 w-10 items-center justify-center">
          <Image src="/images/spanish-flag.png" alt="Spanish" width={32} height={32} className="rounded-full" />
        </div>

        {/* XP counter */}
        <div className="flex items-center gap-1">
          <div className="flex h-8 w-8 items-center justify-center">
            <Image src="/images/xp-star.png" alt="XP" width={28} height={28} />
          </div>
          <span className="text-lg font-bold text-white">250</span>
        </div>

        {/* Hearts counter */}
        <div className="flex items-center gap-1">
          <div className="flex h-8 w-8 items-center justify-center">
            <Image src="/images/heart.png" alt="Hearts" width={24} height={24} />
          </div>
          <span className="text-lg font-bold text-white">5</span>
        </div>
      </div>
    </div>
  )
}
