"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { LearnHeader } from "@/components/learn-header"
import { StepItem } from "@/components/step-item"
import { LockIcon } from "@/components/learn-icons"
import { CircularProgress } from "@/components/circular-progress"
import { GuidebookDrawer } from "@/components/guidebook-drawer"
import Xarrow from "react-xarrows"
// Add this import at the top of the file
import { channelSections } from "@/lib/channel-sections"

// Add this CSS class to hide scrollbars
const scrollbarHideStyle = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`

// Define the sections data with steps
const sections = [
  {
    id: 1,
    title: "Form basic sentences",
    description: "Learn the fundamentals of Spanish including basic greetings and simple phrases.",
    level: "A1",
    difficulty: "Easy",
    progress: 38,
    completedSteps: 3,
    totalSteps: 8,
    isUnlocked: true,
    isActive: true,
    color: "#58CC02", // Green
    sectionNumber: 1,
    unitNumber: 1,
    steps: [
      { id: 1, type: "lesson", progress: 100 },
      { id: 2, type: "lesson", progress: 100 },
      { id: 3, type: "quiz", progress: 100 },
      { id: 4, type: "lesson", progress: 50 },
      { id: 5, type: "lesson", progress: 0 },
      { id: 6, type: "quiz", progress: 0 },
      { id: 7, type: "lesson", progress: 0 },
      { id: 8, type: "quiz", progress: 0 },
    ],
  },
  {
    id: 2,
    title: "Greet people",
    description: "Master common phrases and expressions used in everyday conversations.",
    level: "A1",
    difficulty: "Medium",
    progress: 0,
    completedSteps: 0,
    totalSteps: 6,
    isUnlocked: false,
    isActive: false,
    color: "#A560E8", // Purple
    sectionNumber: 1,
    unitNumber: 2,
    steps: [
      { id: 1, type: "lesson", progress: 0 },
      { id: 2, type: "quiz", progress: 0 },
      { id: 3, type: "lesson", progress: 0 },
      { id: 4, type: "lesson", progress: 0 },
      { id: 5, type: "quiz", progress: 0 },
      { id: 6, type: "lesson", progress: 0 },
    ],
  },
  {
    id: 3,
    title: "Get around in a city",
    description: "Learn vocabulary and phrases for navigating urban environments",
    level: "A1",
    difficulty: "Medium",
    progress: 0,
    completedSteps: 0,
    totalSteps: 10,
    isUnlocked: false,
    isActive: false,
    color: "#1CB0F6", // Blue
    sectionNumber: 1,
    unitNumber: 3,
    steps: [
      { id: 1, type: "lesson", progress: 0 },
      { id: 2, type: "lesson", progress: 0 },
      { id: 3, type: "quiz", progress: 0 },
      { id: 4, type: "lesson", progress: 0 },
      { id: 5, type: "quiz", progress: 0 },
      { id: 6, type: "lesson", progress: 0 },
    ],
  },
  {
    id: 4,
    title: "Order food and drink",
    description: "Master essential phrases for restaurants and cafes",
    level: "A2",
    difficulty: "Hard",
    progress: 0,
    completedSteps: 0,
    totalSteps: 12,
    isUnlocked: false,
    isActive: false,
    color: "#FF9600", // Orange
    sectionNumber: 1,
    unitNumber: 4,
    steps: [
      { id: 1, type: "lesson", progress: 0 },
      { id: 2, type: "quiz", progress: 0 },
      { id: 3, type: "lesson", progress: 0 },
      { id: 4, type: "lesson", progress: 0 },
      { id: 5, type: "quiz", progress: 0 },
      { id: 6, type: "lesson", progress: 0 },
    ],
  },
]

export default function SectionPage({ params }: { params: { sectionId: string } }) {
  const sectionId = Number.parseInt(params.sectionId)
  const [activeSection, setActiveSection] = useState(sections.find((s) => s.id === sectionId) || sections[0])
  const [isGuidebookOpen, setIsGuidebookOpen] = useState(false)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Get next section
  const currentSectionIndex = sections.findIndex((section) => section.id === sectionId)
  const nextSection = currentSectionIndex < sections.length - 1 ? sections[currentSectionIndex + 1] : null

  // Handle click on the first step (jump button)
  const handleJumpClick = (section: any) => {
    // Always navigate to the first step of the section
    const firstStep = section.steps[0]
    if (firstStep) {
      if (firstStep.type === "lesson") {
        router.push(`/learn/section/${section.id}/lesson/${firstStep.id}`)
      } else if (firstStep.type === "quiz") {
        router.push(`/learn/section/${section.id}/quiz/${firstStep.id}`)
      }
    }
  }

  // Handle click on a step
  const handleStepClick = (step: any, isPrevStepCompleted: boolean, sectionId: number) => {
    if (!isPrevStepCompleted) return // Don't navigate if previous step is not completed

    // Navigate to the appropriate page based on step type
    if (step.type === "lesson") {
      router.push(`/learn/section/${sectionId}/lesson/${step.id}`)
    } else if (step.type === "quiz") {
      router.push(`/learn/section/${sectionId}/quiz/${step.id}`)
    }
  }

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Set up intersection observer to detect which section is in view
  useEffect(() => {
    const observers = sections.map((section, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(sections[index])
            }
          })
        },
        { threshold: 0.5 }, // Trigger when 50% of the element is visible
      )

      if (sectionRefs.current[index]) {
        observer.observe(sectionRefs.current[index]!)
      }

      return observer
    })

    // Cleanup
    return () => {
      observers.forEach((observer, index) => {
        if (sectionRefs.current[index]) {
          observer.unobserve(sectionRefs.current[index]!)
        }
      })
    }
  }, [])

  // Force a redraw of arrows after a short delay to ensure all elements are rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      // This state update will trigger a re-render
      setMounted((prev) => prev)
    }, 500)

    return () => clearTimeout(timer)
  }, [mounted])

  return (
    <div className="min-h-screen bg-yaralex-background pb-20">
      {/* Apply the scrollbar hiding CSS */}
      <style jsx global>
        {scrollbarHideStyle}
      </style>
      {/* Pass the channel name to the LearnHeader instead of section title */}
      <LearnHeader sectionTitle="Spanish Learning" />

      {/* Horizontal section list at the top - now scrollable with dashed lines */}
      <div className="mx-auto max-w-3xl px-4 py-6 overflow-hidden">
        <div
          className="flex items-center w-full overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {channelSections.map((section, index) => {
            const isActive = section.id === sectionId
            const progress = (section.completedSteps / section.totalSteps) * 100

            return (
              <>
                {/* Dashed line before each section (except the first) */}
                {index > 0 && <div className="flex-1 h-0 border-t-2 border-dashed border-[#4B4B4B] mx-4 mb-4"></div>}

                <div
                  className="flex flex-col items-center cursor-pointer flex-shrink-0"
                  key={section.id}
                  onClick={() => router.push(`/learn/section/${section.id}`)}
                >
                  <CircularProgress
                    progress={progress}
                    size={56} // Reduced from 64 to make it slightly smaller
                    strokeWidth={4}
                    color={isActive ? section.color : progress === 100 ? "#58CC02" : "#4B4B4B"}
                    bgColor="#1E2B31"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full" // Reduced from h-12 w-12
                      style={{
                        backgroundColor: isActive ? section.color : progress === 100 ? "#58CC02" : "#1E2B31",
                      }}
                    >
                      <span className="text-md font-bold text-white">{section.id}</span> {/* Reduced from text-lg */}
                    </div>
                  </CircularProgress>

                  {/* Section title below the circle */}
                  <span className={`mt-2 text-xs text-center ${isActive ? "text-white" : "text-white/50"}`}>
                    {section.title.length > 10 ? section.title.substring(0, 10) + "..." : section.title}
                  </span>
                </div>
              </>
            )
          })}
        </div>
      </div>

      {/* Section header - sticky and changes color/text on scroll with rounded corners */}
      <div
        className="sticky mx-auto max-w-3xl top-16 z-10 w-full transition-colors duration-300 mb-4 rounded-xl"
        style={{ backgroundColor: activeSection.color }}
      >
        <div className="flex max-w-3xl items-center justify-between rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/30">
              <span className="text-sm font-bold text-white">{activeSection.unitNumber}</span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase">
                Section {activeSection.sectionNumber}, Unit {activeSection.unitNumber}
              </div>
              <div className="text-lg font-bold">{activeSection.title}</div>
            </div>
          </div>
          <button
            onClick={() => setIsGuidebookOpen(true)}
            className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-sm font-bold hover:bg-white/90 transition-colors"
            style={{ color: activeSection.color }}
          >
            GUIDEBOOK
          </button>
        </div>
      </div>

      {/* Learning path - centered container with spiral layout */}
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="w-full">
            {/* Section content */}
            <div ref={(el) => (sectionRefs.current[sectionIndex] = el)} className="relative w-full py-8">
              <div className="flex flex-col items-center">
                {/* Jump here button */}
                <div className="mb-20">
                  <div className="flex flex-col items-center">
                    <button
                      className="mb-2 rounded-md bg-[#1E2B31] px-3 py-1 text-xs font-bold"
                      style={{ color: section.color }}
                      onClick={() => handleJumpClick(section)}
                    >
                      JUMP HERE?
                    </button>
                    <div
                      id={`section-${section.id}-jump`}
                      className="cursor-pointer"
                      onClick={() => handleJumpClick(section)}
                    >
                      <CircularProgress
                        progress={section.steps[0]?.progress || 0}
                        size={80}
                        strokeWidth={4}
                        color={section.color}
                        bgColor="#1E2B31"
                      >
                        <StepItem
                          type="lesson"
                          progress={section.steps[0]?.progress || 0}
                          color={section.color} // Jump button always uses section color
                          isActive={true}
                          className="transform scale-90" // Make step item slightly smaller to fit in the circle
                        />
                      </CircularProgress>
                    </div>
                  </div>
                </div>

                {/* Spiral layout for steps */}
                <div className="relative flex flex-col items-center">
                  {section.steps.map((step, index) => {
                    // Determine position in spiral (left, center, right)
                    let positionClass = ""
                    if (index % 3 === 0) positionClass = "ml-36"
                    else if (index % 3 === 1) positionClass = "mr-36"
                    // index % 3 === 2 stays centered

                    const stepId = `section-${section.id}-step-${step.id}`
                    const prevStepId =
                      index === 0
                        ? `section-${section.id}-jump`
                        : `section-${section.id}-step-${section.steps[index - 1].id}`

                    // Check if previous step is completed
                    const prevStepProgress = index === 0 ? section.steps[0].progress : section.steps[index - 1].progress
                    const isPrevStepCompleted = prevStepProgress === 100

                    // Determine colors based on previous step completion
                    const lineColor = isPrevStepCompleted ? section.color : "#4B4B4B"
                    const stepColor = isPrevStepCompleted ? section.color : undefined

                    return (
                      <div key={step.id} className={`mb-20 ${positionClass}`}>
                        <div
                          id={stepId}
                          className="cursor-pointer relative"
                          onClick={() => handleStepClick(step, isPrevStepCompleted, section.id)}
                        >
                          {/* Add circular progress around step */}
                          <CircularProgress
                            progress={step.progress}
                            size={80}
                            strokeWidth={4}
                            color={isPrevStepCompleted ? section.color : "#4B4B4B"}
                            bgColor="#1E2B31"
                          >
                            <StepItem
                              type={step.type as "lesson" | "quiz"}
                              progress={step.progress}
                              color={stepColor} // Use section color only if previous step is completed
                              isActive={isPrevStepCompleted}
                              className="transform scale-90" // Make step item slightly smaller to fit in the circle
                            />
                          </CircularProgress>
                        </div>

                        {/* Connect with arrow to previous step */}
                        {mounted && (
                          <Xarrow
                            start={prevStepId}
                            end={stepId}
                            color={lineColor} // Use section color only if previous step is completed
                            strokeWidth={9}
                            path="smooth"
                            curveness={0.8}
                            startAnchor="bottom"
                            endAnchor="top"
                            showHead={false}
                            zIndex={0}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Section divider - don't show after the last section */}
            {sectionIndex < sections.length - 1 && (
              <div className="my-8 flex w-full items-center justify-center">
                <div className="h-1 rounded-full w-full flex-1 bg-[#1E2B31]"></div>
                <span className="mx-4 text-md font-bold text-[#8f9ba3]">{sections[sectionIndex + 1].title}</span>
                <div className="h-1 rounded-full w-full flex-1 bg-[#1E2B31]"></div>
              </div>
            )}
          </div>
        ))}

        {/* Up Next Card - only show if there's a next section */}
        {nextSection && (
          <div className="mx-auto w-full max-w-3xl mb-12">
            <div className="flex flex-col gap-2 items-center rounded-xl bg-[#131F24] border-[3px] border-[#1E2B31] p-8">
              <div className="mb-2 text-sm font-bold text-[#8f9ba3] bg-[#1E2B31] rounded-md px-2 py-1">UP NEXT</div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <LockIcon className="h-7 w-7 text-white" />
                <h3 className="text-2xl font-bold text-white text-center">Section {nextSection.id}</h3>
              </div>

              <p className="mb-8 text-[#8f9ba3] text-center">{nextSection.description}</p>

              <button
                className="w-full rounded-xl border border-[#1CB0F6] py-3 text-[#1CB0F6] font-bold hover:bg-[#1CB0F6]/10 transition-colors"
                onClick={() => router.push(`/learn/section/${nextSection.id}`)}
              >
                JUMP HERE?
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guidebook Drawer */}
      <GuidebookDrawer isOpen={isGuidebookOpen} onClose={() => setIsGuidebookOpen(false)} section={activeSection} />
    </div>
  )
}
