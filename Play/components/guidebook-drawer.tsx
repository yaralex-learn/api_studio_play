"use client"
import { X, BookOpen, Target, Clock } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface GuidebookDrawerProps {
  isOpen: boolean
  onClose: () => void
  section: {
    id: number
    title: string
    description: string
    level: string
    difficulty: string
    color: string
    unitNumber: number
    sectionNumber: number
    totalSteps: number
    completedSteps: number
  }
}

// Mock guidebook content for different sections
const guidebookContent = {
  1: {
    title: "Form Basic Sentences",
    overview:
      "In this unit, you'll learn the fundamental building blocks of Spanish sentences. We'll start with simple subject-verb-object structures and gradually build complexity.",
    objectives: [
      "Understand basic Spanish sentence structure",
      "Learn essential verbs and their conjugations",
      "Practice forming simple statements and questions",
      "Master basic vocabulary for everyday situations",
    ],
    keyTopics: [
      {
        title: "Sentence Structure",
        description: "Learn the basic word order in Spanish sentences",
        image: "/diverse-group-meeting.png",
      },
      {
        title: "Essential Verbs",
        description: "Master the most common verbs: ser, estar, tener, hacer",
        image: "/blue-abstract-flow.png",
      },
      {
        title: "Basic Vocabulary",
        description: "Build your foundation with everyday words and phrases",
        image: "/elemental-bending.png",
      },
    ],
    tips: [
      "Practice speaking out loud, even when alone",
      "Don't worry about perfect pronunciation at first",
      "Focus on understanding the sentence patterns",
      "Use flashcards for new vocabulary",
    ],
    estimatedTime: "2-3 hours",
    difficulty: "Beginner",
  },
  2: {
    title: "Greet People",
    overview:
      "Master the art of Spanish greetings and introductions. Learn formal and informal ways to meet people and make great first impressions.",
    objectives: [
      "Learn formal and informal greetings",
      "Practice introducing yourself and others",
      "Understand cultural context of greetings",
      "Master polite expressions and responses",
    ],
    keyTopics: [
      {
        title: "Basic Greetings",
        description: "Hola, Buenos días, Buenas tardes, Buenas noches",
        image: "/friendly-meeting.png",
      },
      {
        title: "Introductions",
        description: "Me llamo, Soy, Mucho gusto, Encantado/a",
        image: "/diverse-group-meeting.png",
      },
      {
        title: "Polite Expressions",
        description: "Por favor, Gracias, De nada, Disculpe",
        image: "/heartfelt-gratitude.png",
      },
    ],
    tips: [
      "Pay attention to formal vs informal contexts",
      "Practice with different times of day",
      "Learn the cultural significance of greetings",
      "Remember that handshakes are common in Spanish-speaking countries",
    ],
    estimatedTime: "1-2 hours",
    difficulty: "Beginner",
  },
}

export function GuidebookDrawer({ isOpen, onClose, section }: GuidebookDrawerProps) {
  const content = guidebookContent[section.id as keyof typeof guidebookContent] || guidebookContent[1]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-yaralex-background border-l border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 p-6 border-b border-white/10" style={{ backgroundColor: section.color }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-white" />
                  <div>
                    <h1 className="text-xl font-bold text-white">Unit Guidebook</h1>
                    <p className="text-white/80 text-sm">
                      Section {section.sectionNumber}, Unit {section.unitNumber}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Unit Title */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{content.title}</h2>
                <p className="text-white/70 leading-relaxed">{content.overview}</p>
              </div>

              {/* Unit Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1E2B31] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-white/60" />
                    <span className="text-white/60 text-sm">Estimated Time</span>
                  </div>
                  <p className="text-white font-medium">{content.estimatedTime}</p>
                </div>
                <div className="bg-[#1E2B31] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-white/60" />
                    <span className="text-white/60 text-sm">Difficulty</span>
                  </div>
                  <p className="text-white font-medium">{content.difficulty}</p>
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Learning Objectives</h3>
                <div className="space-y-2">
                  {content.objectives.map((objective, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: section.color }}
                      />
                      <p className="text-white/80">{objective}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Topics */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Key Topics</h3>
                <div className="space-y-4">
                  {content.keyTopics.map((topic, index) => (
                    <div key={index} className="bg-[#1E2B31] rounded-lg p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={topic.image || "/placeholder.svg"}
                            alt={topic.title}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-1">{topic.title}</h4>
                          <p className="text-white/70 text-sm">{topic.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Tips */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Study Tips</h3>
                <div className="bg-[#1E2B31] rounded-lg p-4">
                  <div className="space-y-3">
                    {content.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: section.color }}
                        />
                        <p className="text-white/80 text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Your Progress</h3>
                <div className="bg-[#1E2B31] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70">Steps Completed</span>
                    <span className="text-white font-medium">
                      {section.completedSteps}/{section.totalSteps}
                    </span>
                  </div>
                  <div className="w-full bg-[#131F24] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(section.completedSteps / section.totalSteps) * 100}%`,
                        backgroundColor: section.color,
                      }}
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-2">
                    {Math.round((section.completedSteps / section.totalSteps) * 100)}% complete
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-lg font-bold text-white transition-colors"
                  style={{ backgroundColor: section.color }}
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
