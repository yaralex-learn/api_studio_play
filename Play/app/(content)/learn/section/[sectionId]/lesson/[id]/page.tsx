"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BackIcon } from "@/components/learn-icons"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ImageTextTemplate } from "@/components/lesson-templates/image-text-template"
import { VideoTextTemplate } from "@/components/lesson-templates/video-text-template"
import { AudioTextTemplate } from "@/components/lesson-templates/audio-text-template"
import { TextOnlyTemplate } from "@/components/lesson-templates/text-only-template"
import { MultipleChoiceTemplate } from "@/components/lesson-templates/multiple-choice-template"

// Define the types of lesson items
type LessonItemType = "image-text" | "video-text" | "audio-text" | "text-only" | "multiple-choice"

// Define the structure for different lesson item types
interface BaseLessonItem {
  type: LessonItemType
  id: number
}

interface ImageTextItem extends BaseLessonItem {
  type: "image-text"
  imageUrl: string
  text: string
  caption?: string
}

interface VideoTextItem extends BaseLessonItem {
  type: "video-text"
  videoUrl: string
  text: string
  caption?: string
}

interface AudioTextItem extends BaseLessonItem {
  type: "audio-text"
  audioUrl: string
  text: string
  caption?: string
}

interface TextOnlyItem extends BaseLessonItem {
  type: "text-only"
  text: string
}

interface MultipleChoiceItem extends BaseLessonItem {
  type: "multiple-choice"
  question: string
  options: string[]
  correctAnswer: string
}

type LessonItem = ImageTextItem | VideoTextItem | AudioTextItem | TextOnlyItem | MultipleChoiceItem

// Mock lesson data
const lessonData = {
  1: {
    id: 1,
    title: "Basic Greetings",
    sectionId: 1,
    content: "Learn how to say hello and goodbye in Spanish.",
    items: [
      {
        id: 1,
        type: "text-only",
        text: "Welcome to your first Spanish lesson! In this lesson, you'll learn basic greetings in Spanish.",
      },
      {
        id: 2,
        type: "image-text",
        imageUrl: "/friendly-meeting.png",
        text: "The most common greeting in Spanish is 'Hola', which means 'Hello'.",
      },
      {
        id: 3,
        type: "audio-text",
        audioUrl: "/audio/hola.mp3",
        text: "Listen and repeat: Hola (Hello)",
      },
      {
        id: 4,
        type: "video-text",
        videoUrl: "/video/greetings.mp4",
        text: "Watch how to greet someone in Spanish",
      },
      {
        id: 5,
        type: "multiple-choice",
        question: "How do you say 'Hello' in Spanish?",
        options: ["Hola", "Adiós", "Gracias", "Por favor"],
        correctAnswer: "Hola",
      },
      {
        id: 6,
        type: "image-text",
        imageUrl: "/farewell-wave.png",
        text: "To say goodbye in Spanish, you can say 'Adiós'.",
      },
      {
        id: 7,
        type: "audio-text",
        audioUrl: "/audio/adios.mp3",
        text: "Listen and repeat: Adiós (Goodbye)",
      },
      {
        id: 8,
        type: "multiple-choice",
        question: "How do you say 'Goodbye' in Spanish?",
        options: ["Hola", "Adiós", "Gracias", "Por favor"],
        correctAnswer: "Adiós",
      },
    ],
  },
  2: {
    id: 2,
    title: "Basic Phrases",
    sectionId: 1,
    content: "Learn common phrases in Spanish.",
    items: [
      {
        id: 1,
        type: "text-only",
        text: "In this lesson, you'll learn some basic phrases in Spanish that will help you in everyday conversations.",
      },
      {
        id: 2,
        type: "image-text",
        imageUrl: "/heartfelt-gratitude.png",
        text: "To say 'Thank you' in Spanish, you say 'Gracias'.",
      },
      {
        id: 3,
        type: "audio-text",
        audioUrl: "/audio/gracias.mp3",
        text: "Listen and repeat: Gracias (Thank you)",
      },
      {
        id: 4,
        type: "multiple-choice",
        question: "How do you say 'Thank you' in Spanish?",
        options: ["Hola", "Adiós", "Gracias", "Por favor"],
        correctAnswer: "Gracias",
      },
      {
        id: 5,
        type: "image-text",
        imageUrl: "/thoughtful-request.png",
        text: "To say 'Please' in Spanish, you say 'Por favor'.",
      },
      {
        id: 6,
        type: "audio-text",
        audioUrl: "/audio/porfavor.mp3",
        text: "Listen and repeat: Por favor (Please)",
      },
      {
        id: 7,
        type: "multiple-choice",
        question: "How do you say 'Please' in Spanish?",
        options: ["Hola", "Adiós", "Gracias", "Por favor"],
        correctAnswer: "Por favor",
      },
    ],
  },
}

export default function LessonPage({ params }: { params: { id: string; sectionId: string } }) {
  const router = useRouter()
  const lessonId = Number.parseInt(params.id)
  const sectionId = Number.parseInt(params.sectionId)
  const [currentLesson, setCurrentLesson] = useState<any>(null)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [hearts, setHearts] = useState(5) // Number of hearts/lives
  const [direction, setDirection] = useState<"next" | "prev">("next")

  useEffect(() => {
    // Fetch lesson data based on ID
    const lesson = lessonData[lessonId as keyof typeof lessonData]
    if (lesson) {
      setCurrentLesson(lesson)
    } else {
      // Redirect to section page if lesson not found
      router.push(`/learn/section/${params.sectionId}`)
    }
  }, [lessonId, params.sectionId, router])

  if (!currentLesson) {
    return (
      <div className="flex h-[100vh] items-center justify-center">
        <div className="text-xl text-white">Loading lesson...</div>
      </div>
    )
  }

  const currentItem = currentLesson.items[currentItemIndex] as LessonItem
  const progress = ((currentItemIndex + 1) / currentLesson.items.length) * 100
  const isFirstItem = currentItemIndex === 0
  const isLastItem = currentItemIndex === currentLesson.items.length - 1

  const handleAnswerSelect = (answer: string) => {
    if (currentItem.type !== "multiple-choice") return

    setSelectedAnswer(answer)
    const correct = answer === currentItem.correctAnswer
    setIsCorrect(correct)
    if (!correct) {
      // Reduce hearts if answer is incorrect
      setHearts((prev) => Math.max(0, prev - 1))
    }
  }

  const handleNext = () => {
    if (currentItemIndex < currentLesson.items.length - 1) {
      setDirection("next")
      setCurrentItemIndex(currentItemIndex + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
    } else {
      // Lesson completed, redirect back to section
      router.push(`/learn/section/${params.sectionId}`)
    }
  }

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setDirection("prev")
      setCurrentItemIndex(currentItemIndex - 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
    }
  }

  // Determine if we should show the next button based on the current item type
  const showNextButton = currentItem.type !== "multiple-choice" || selectedAnswer !== null

  // Render the appropriate component based on the item type
  const renderItem = (item: LessonItem) => {
    switch (item.type) {
      case "image-text":
        return <ImageTextTemplate item={item} />
      case "video-text":
        return <VideoTextTemplate item={item} />
      case "audio-text":
        return <AudioTextTemplate item={item} />
      case "text-only":
        return <TextOnlyTemplate item={item} />
      case "multiple-choice":
        return (
          <MultipleChoiceTemplate
            item={item}
            selectedAnswer={selectedAnswer}
            isCorrect={isCorrect}
            onSelectAnswer={handleAnswerSelect}
          />
        )
      default:
        return <p>Unknown item type</p>
    }
  }

  return (
    <div className="min-h-screen bg-yaralex-background pb-20">
      {/* Top progress bar with back button and hearts */}
      <div className="sticky top-0 z-30 bg-yaralex-background pt-6 pb-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4 py-3 px-4">
          <Link
            href={`/learn/section/${params.sectionId}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <BackIcon className="h-6 w-6 text-white" />
          </Link>

          <div className="relative flex-1 h-3">
            <div className="absolute inset-0 rounded-full bg-[#1E2B31]" style={{ height: "12px" }}></div>
            <motion.div
              className="absolute inset-0 rounded-full bg-yaralex-green origin-left"
              initial={{ width: `${(currentItemIndex / currentLesson.items.length) * 100}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ height: "12px" }}
            />
          </div>

          <div className="flex items-center gap-1">
            <div className="flex h-8 w-8 items-center justify-center">
              <Image src="/images/heart.png" alt="Hearts" width={24} height={24} />
            </div>
            <span className="text-lg font-bold text-white">{hearts}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto py-12 px-4 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentItemIndex}
            initial={{
              opacity: 0,
              x: direction === "next" ? 54 : -54,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{ duration: 0.1, ease: ["easeOut", "easeIn"] }}
            className="flex justify-center items-center min-h-[50vh] w-full"
          >
            {renderItem(currentItem)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed bottom bar with navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t-2 border-[#4B4B4B]">
        <div className="max-w-5xl mx-auto flex justify-between items-center py-8">
          {/* Previous button - only show if not the first item */}
          {!isFirstItem && (
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="bg-transparent hover:bg-black/10 border-2 border-[#4B4B4B] !text-[#4B4B4B] text-[1rem] font-bold px-[2.5rem] py-6 rounded-xl"
            >
              PREVIOUS
            </Button>
          )}

          {/* Empty div to maintain spacing when Previous button is hidden */}
          {isFirstItem && <div></div>}

          {/* Next button - show for all non-multiple-choice items or when an answer is selected */}
          {showNextButton && (
            <Button
              onClick={handleNext}
              className="bg-yaralex-green border-2 border-yaralex-green hover:bg-yaralex-green/90 text-[#131F24] text-[1rem] font-bold px-[2.5rem] py-6 rounded-xl"
            >
              {isLastItem ? "COMPLETE" : "NEXT"}
            </Button>
          )}

          {/* Check button - only show for multiple-choice items when no answer is selected */}
          {currentItem.type === "multiple-choice" && selectedAnswer === null && (
            <Button
              disabled={true}
              className="bg-yaralex-green/50 text-[#131F24]/50 font-bold text-[1rem] px-[2.5rem] py-6 rounded-xl cursor-not-allowed"
            >
              CHECK
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
