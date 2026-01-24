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

// Define the types of practice items
type PracticeItemType = "image-text" | "video-text" | "audio-text" | "text-only" | "multiple-choice"

// Define the structure for different practice item types
interface BasePracticeItem {
  type: PracticeItemType
  id: number
}

interface ImageTextItem extends BasePracticeItem {
  type: "image-text"
  imageUrl: string
  text: string
  caption?: string
}

interface VideoTextItem extends BasePracticeItem {
  type: "video-text"
  videoUrl: string
  text: string
  caption?: string
}

interface AudioTextItem extends BasePracticeItem {
  type: "audio-text"
  audioUrl: string
  text: string
  caption?: string
}

interface TextOnlyItem extends BasePracticeItem {
  type: "text-only"
  text: string
}

interface MultipleChoiceItem extends BasePracticeItem {
  type: "multiple-choice"
  question: string
  options: string[]
  correctAnswer: string
}

type PracticeItem = ImageTextItem | VideoTextItem | AudioTextItem | TextOnlyItem | MultipleChoiceItem

// Mock practice content data
const practiceContentData = {
  1: {
    id: 1,
    title: "Listening Practice",
    skillId: "listening",
    content: "Practice your listening skills with these exercises.",
    color: "#FF9600", // Orange
    items: [
      {
        id: 1,
        type: "text-only",
        text: "Welcome to your listening practice! In this session, you'll practice understanding spoken Spanish.",
      },
      {
        id: 2,
        type: "audio-text",
        audioUrl: "/audio/listening1.mp3",
        text: "Listen to the following conversation and answer the question.",
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "What did María say she was doing this weekend?",
        options: ["Going to the beach", "Studying for an exam", "Visiting her grandmother", "Working at a restaurant"],
        correctAnswer: "Visiting her grandmother",
      },
      {
        id: 4,
        type: "audio-text",
        audioUrl: "/audio/listening2.mp3",
        text: "Listen to the weather forecast and answer the question.",
      },
      {
        id: 5,
        type: "multiple-choice",
        question: "What will the weather be like tomorrow?",
        options: ["Sunny", "Rainy", "Cloudy", "Snowy"],
        correctAnswer: "Rainy",
      },
    ],
  },
  2: {
    id: 2,
    title: "Speaking Practice",
    skillId: "speaking",
    content: "Practice your pronunciation with these exercises.",
    color: "#1CB0F6", // Blue
    items: [
      {
        id: 1,
        type: "text-only",
        text: "Welcome to your speaking practice! In this session, you'll practice your Spanish pronunciation.",
      },
      {
        id: 2,
        type: "audio-text",
        audioUrl: "/audio/speaking1.mp3",
        text: "Listen and repeat: Buenos días (Good morning)",
      },
      {
        id: 3,
        type: "image-text",
        imageUrl: "/friendly-meeting.png",
        text: "Practice saying this greeting to someone you meet in the morning.",
      },
      {
        id: 4,
        type: "audio-text",
        audioUrl: "/audio/speaking2.mp3",
        text: "Listen and repeat: ¿Cómo estás? (How are you?)",
      },
      {
        id: 5,
        type: "video-text",
        videoUrl: "/video/conversation.mp4",
        text: "Watch this conversation and practice the pronunciation.",
      },
    ],
  },
  3: {
    id: 3,
    title: "Reading Practice",
    skillId: "reading",
    content: "Improve your reading comprehension with these exercises.",
    color: "#58CC02", // Green
    items: [
      {
        id: 1,
        type: "text-only",
        text: "Welcome to your reading practice! In this session, you'll practice understanding written Spanish.",
      },
      {
        id: 2,
        type: "image-text",
        imageUrl: "/bioluminescent-forest.png",
        text: "Read the following passage: 'El bosque es muy hermoso en primavera. Los árboles son verdes y las flores son coloridas.'",
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "According to the passage, when is the forest beautiful?",
        options: ["In summer", "In spring", "In winter", "In autumn"],
        correctAnswer: "In spring",
      },
      {
        id: 4,
        type: "image-text",
        imageUrl: "/diverse-group-meeting.png",
        text: "Read the following passage: 'María y Juan van al mercado todos los sábados. Compran frutas y verduras frescas.'",
      },
      {
        id: 5,
        type: "multiple-choice",
        question: "What do María and Juan buy at the market?",
        options: ["Clothes", "Books", "Fresh fruits and vegetables", "Electronics"],
        correctAnswer: "Fresh fruits and vegetables",
      },
    ],
  },
  4: {
    id: 4,
    title: "Writing Practice",
    skillId: "writing",
    content: "Practice writing sentences with these exercises.",
    color: "#A560E8", // Purple
    items: [
      {
        id: 1,
        type: "text-only",
        text: "Welcome to your writing practice! In this session, you'll practice writing in Spanish.",
      },
      {
        id: 2,
        type: "image-text",
        imageUrl: "/elemental-bending.png",
        text: "Write a sentence describing this image. Example: 'La persona está practicando un deporte.'",
      },
      {
        id: 3,
        type: "text-only",
        text: "Now, let's practice writing a short paragraph. Describe your daily routine in Spanish.",
      },
      {
        id: 4,
        type: "image-text",
        imageUrl: "/blue-abstract-flow.png",
        text: "Write three sentences about your favorite color. Example: 'Mi color favorito es azul. El azul me recuerda al cielo. Me gusta usar ropa azul.'",
      },
      {
        id: 5,
        type: "text-only",
        text: "Great job with your writing practice! Remember to practice regularly to improve your skills.",
      },
    ],
  },
  5: {
    id: 5,
    title: "Vocabulary Practice",
    skillId: "vocabulary",
    content: "Expand your vocabulary with these exercises.",
    color: "#FFDE00", // Yellow
    items: [
      {
        id: 1,
        type: "text-only",
        text: "Welcome to your vocabulary practice! In this session, you'll learn and practice new Spanish words.",
      },
      {
        id: 2,
        type: "image-text",
        imageUrl: "/friendly-meeting.png",
        text: "La familia (The family): padre (father), madre (mother), hijo (son), hija (daughter)",
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "What is the Spanish word for 'daughter'?",
        options: ["Padre", "Madre", "Hijo", "Hija"],
        correctAnswer: "Hija",
      },
      {
        id: 4,
        type: "image-text",
        imageUrl: "/heartfelt-gratitude.png",
        text: "Los colores (The colors): rojo (red), azul (blue), verde (green), amarillo (yellow)",
      },
      {
        id: 5,
        type: "multiple-choice",
        question: "What is the Spanish word for 'yellow'?",
        options: ["Rojo", "Azul", "Verde", "Amarillo"],
        correctAnswer: "Amarillo",
      },
    ],
  },
  6: {
    id: 6,
    title: "Grammar Practice",
    skillId: "grammar",
    content: "Master grammar rules with these exercises.",
    color: "#FF4B4B", // Red
    items: [
      {
        id: 1,
        type: "text-only",
        text: "Welcome to your grammar practice! In this session, you'll practice Spanish grammar rules.",
      },
      {
        id: 2,
        type: "image-text",
        imageUrl: "/thoughtful-request.png",
        text: "Present tense conjugation: Yo hablo (I speak), Tú hablas (You speak), Él/Ella habla (He/She speaks)",
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "What is the correct conjugation of 'hablar' for 'nosotros' (we)?",
        options: ["Hablo", "Hablas", "Habla", "Hablamos"],
        correctAnswer: "Hablamos",
      },
      {
        id: 4,
        type: "text-only",
        text: "Now let's practice the past tense (pretérito): Yo hablé (I spoke), Tú hablaste (You spoke), Él/Ella habló (He/She spoke)",
      },
      {
        id: 5,
        type: "multiple-choice",
        question: "What is the correct past tense conjugation of 'hablar' for 'tú' (you)?",
        options: ["Hablé", "Hablaste", "Habló", "Hablamos"],
        correctAnswer: "Hablaste",
      },
    ],
  },
}

// Get the color based on the skill ID
const getColorClass = (skillId: string) => {
  switch (skillId) {
    case "listening":
      return "bg-yaralex-orange"
    case "speaking":
      return "bg-yaralex-blue"
    case "reading":
      return "bg-yaralex-green"
    case "writing":
      return "bg-yaralex-purple"
    case "vocabulary":
      return "bg-yaralex-yellow"
    case "grammar":
      return "bg-yaralex-red"
    default:
      return "bg-yaralex-green"
  }
}

export default function PracticeContentPage({ params }: { params: { practiceId: string } }) {
  const router = useRouter()
  const practiceId = Number.parseInt(params.practiceId)
  const [currentPractice, setCurrentPractice] = useState<any>(null)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [hearts, setHearts] = useState(5) // Number of hearts/lives
  const [direction, setDirection] = useState<"next" | "prev">("next")

  useEffect(() => {
    // Fetch practice data based on ID
    const practice = practiceContentData[practiceId as keyof typeof practiceContentData]
    if (practice) {
      setCurrentPractice(practice)
    } else {
      // Redirect to practice page if practice not found
      router.push(`/practice`)
    }
  }, [practiceId, router])

  if (!currentPractice) {
    return (
      <div className="flex h-[100vh] items-center justify-center">
        <div className="text-xl text-white">Loading practice content...</div>
      </div>
    )
  }

  const currentItem = currentPractice.items[currentItemIndex] as PracticeItem
  const progress = ((currentItemIndex + 1) / currentPractice.items.length) * 100
  const isFirstItem = currentItemIndex === 0
  const isLastItem = currentItemIndex === currentPractice.items.length - 1
  const colorClass = getColorClass(currentPractice.skillId)

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
    if (currentItemIndex < currentPractice.items.length - 1) {
      setDirection("next")
      setCurrentItemIndex(currentItemIndex + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
    } else {
      // Practice completed, redirect back to practice page
      router.push(`/practice`)
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
  const renderItem = (item: PracticeItem) => {
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
            href="/practice"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <BackIcon className="h-6 w-6 text-white" />
          </Link>

          <div className="relative flex-1 h-3">
            <div className="absolute inset-0 rounded-full bg-[#1E2B31]" style={{ height: "12px" }}></div>
            <motion.div
              className={`absolute inset-0 rounded-full ${colorClass} origin-left`}
              initial={{ width: `${(currentItemIndex / currentPractice.items.length) * 100}%` }}
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
              className={`${colorClass} border-2 border-${colorClass} hover:opacity-90 text-[#131F24] text-[1rem] font-bold px-[2.5rem] py-6 rounded-xl`}
            >
              {isLastItem ? "COMPLETE" : "NEXT"}
            </Button>
          )}

          {/* Check button - only show for multiple-choice items when no answer is selected */}
          {currentItem.type === "multiple-choice" && selectedAnswer === null && (
            <Button
              disabled={true}
              className={`${colorClass}/50 text-[#131F24]/50 font-bold text-[1rem] px-[2.5rem] py-6 rounded-xl cursor-not-allowed`}
            >
              CHECK
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
