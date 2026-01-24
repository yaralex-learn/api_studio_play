"use client"
import Link from "next/link"
import { LearnHeader } from "@/components/learn-header"
import { SectionItem } from "@/components/section-item"
import { channelSections } from "@/lib/channel-sections"

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-yaralex-background pb-20">
      <LearnHeader />

      <div className="mx-auto max-w-2xl px-4 py-6">
        {channelSections.map((section, index) => (
          <Link key={section.id} href={`/learn/section/${section.id}`}>
            <SectionItem
              id={section.id}
              title={`Section ${index + 1}: ${section.title}`}
              description={section.description}
              level={section.level}
              difficulty={section.difficulty as "Easy" | "Medium" | "Hard" | "Expert"}
              progress={section.progress}
              completedSteps={section.completedSteps}
              totalSteps={section.totalSteps}
              isActive={section.isActive}
              color={section.color}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
