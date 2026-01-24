"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Define the flashcard type
interface Flashcard {
  id: string
  question: string
  answer: string
  createdAt: string
  lastStudied?: string
  needsReview?: boolean
  level: number
}

// Mock deck data
const mockDecks = {
  "1": { id: "1", title: "Common Verbs", color: "bg-yaralex-yellow" },
  "2": { id: "2", title: "Food & Drinks", color: "bg-yaralex-orange" },
  "3": { id: "3", title: "Travel Phrases", color: "bg-yaralex-blue" },
  "4": { id: "4", title: "Numbers", color: "bg-yaralex-green" },
  "5": { id: "5", title: "Adjectives", color: "bg-yaralex-purple" },
  "6": { id: "6", title: "Daily Routines", color: "bg-yaralex-red" },
}

// Mock initial flashcards
const mockFlashcards: Flashcard[] = [
  {
    id: "1",
    question: "How do you say 'to eat' in Spanish?",
    answer: "comer",
    createdAt: "2025-01-02",
    lastStudied: "2025-01-02",
    needsReview: false,
    level: 1,
  },
  {
    id: "2",
    question: "What is the Spanish word for 'to drink'?",
    answer: "beber",
    createdAt: "2025-01-02",
    needsReview: true,
    level: 1,
  },
  {
    id: "3",
    question: "How do you say 'to speak' in Spanish?",
    answer: "hablar",
    createdAt: "2025-01-01",
    lastStudied: "2025-01-01",
    needsReview: false,
    level: 2,
  },
  {
    id: "4",
    question: "What is the Spanish word for 'to run'?",
    answer: "correr",
    createdAt: "2025-01-01",
    needsReview: true,
    level: 2,
  },
  {
    id: "5",
    question: "How do you say 'to write' in Spanish?",
    answer: "escribir",
    createdAt: "2024-12-30",
    lastStudied: "2024-12-30",
    needsReview: false,
    level: 3,
  },
  {
    id: "6",
    question: "What is the Spanish word for 'to read'?",
    answer: "leer",
    createdAt: "2024-12-29",
    needsReview: true,
    level: 3,
  },
]

export default function FlashcardStudyPage({ params }: { params: { deckId: string } }) {
  const router = useRouter()
  const deckId = params.deckId

  // Get deck info
  const deck = mockDecks[deckId as keyof typeof mockDecks]

  // State
  const [flashcards, setFlashcards] = useState<Flashcard[]>(mockFlashcards)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  // Redirect if deck not found
  useEffect(() => {
    if (!deck) {
      router.push("/flashcards")
    }
  }, [deck, router])

  // Redirect if no cards
  useEffect(() => {
    if (flashcards.length === 0) {
      toast({
        title: "No cards available",
        description: "Add some flashcards to start studying",
        variant: "destructive",
      })
      router.push(`/flashcards/${deckId}`)
    }
  }, [flashcards.length, deckId, router])

  if (!deck || flashcards.length === 0) {
    return null
  }

  const currentCard = flashcards[currentCardIndex]

  // Handle card learning status
  const handleCardLearned = (learned: boolean) => {
    // Update the card's review status
    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === currentCard.id
          ? {
              ...card,
              needsReview: !learned,
              lastStudied: new Date().toISOString().split("T")[0],
            }
          : card,
      ),
    )

    // Move to next card or finish
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    } else {
      // Study session complete
      toast({
        title: "Study session complete!",
        description: `You've reviewed all ${flashcards.length} cards.`,
      })
      router.push(`/flashcards/${deckId}`)
    }
  }

  // Navigate between cards
  const goToNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    }
  }

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
    }
  }

  return (
    <div className="container py-8">
      {/* Study mode header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/flashcards/${deckId}`)}
            className="p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Study Mode</h1>
            <p className="text-white/70">
              Card {currentCardIndex + 1} of {flashcards.length}
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/flashcards/${deckId}`)}
          variant="outline"
          className="border-white/10 text-white hover:bg-white/10"
        >
          Exit Study
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>Progress</span>
          <span>{Math.round(((currentCardIndex + 1) / flashcards.length) * 100)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-yaralex-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Study card */}
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-white/10 bg-white/5 min-h-[400px]">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-8">{currentCard.question}</h2>

              {showAnswer ? (
                <div className="space-y-6">
                  <div className="p-6 bg-yaralex-green/20 rounded-lg border border-yaralex-green/30">
                    <p className="text-xl text-white">{currentCard.answer}</p>
                  </div>

                  {/* Learning buttons */}
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleCardLearned(false)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3"
                    >
                      <X className="mr-2 h-5 w-5" />
                      Need to Review
                    </Button>
                    <Button
                      onClick={() => handleCardLearned(true)}
                      className="bg-yaralex-green hover:bg-yaralex-green/90 text-black font-bold px-8 py-3"
                    >
                      <Check className="mr-2 h-5 w-5" />I Know This
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-white/50">Think about your answer...</p>
                  </div>
                  <Button
                    onClick={() => setShowAnswer(true)}
                    className="bg-yaralex-blue hover:bg-yaralex-blue/90 text-white font-bold px-8 py-3"
                  >
                    Show Answer
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={goToPrevCard}
            disabled={currentCardIndex === 0}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <span className="text-white/70">
            {currentCardIndex + 1} / {flashcards.length}
          </span>

          <Button
            onClick={goToNextCard}
            disabled={currentCardIndex === flashcards.length - 1}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
