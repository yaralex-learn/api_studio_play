"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, ArrowLeft, Sparkles, BookOpen, Play } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

export default function FlashcardDeckPage({ params }: { params: { deckId: string } }) {
  const router = useRouter()
  const deckId = params.deckId

  // Get deck info
  const deck = mockDecks[deckId as keyof typeof mockDecks]

  // State
  const [flashcards, setFlashcards] = useState<Flashcard[]>(mockFlashcards)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false)
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null)

  // Form state
  const [formQuestion, setFormQuestion] = useState("")
  const [formAnswer, setFormAnswer] = useState("")
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [generatedStory, setGeneratedStory] = useState("")

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [flashcardToDelete, setFlashcardToDelete] = useState<string | null>(null)

  // Filter state
  const [activeFilter, setActiveFilter] = useState<"all" | "learned" | "review">("all")

  // Redirect if deck not found
  useEffect(() => {
    if (!deck) {
      router.push("/flashcards")
    }
  }, [deck, router])

  if (!deck) {
    return null
  }

  // Generate AI answer
  const generateAnswer = async () => {
    if (!formQuestion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question first",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingAnswer(true)

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock AI responses based on question content
    let aiAnswer = ""
    const question = formQuestion.toLowerCase()

    if (question.includes("eat") || question.includes("comer")) {
      aiAnswer =
        "comer - This is the infinitive form of the verb 'to eat' in Spanish. Example: Me gusta comer pizza (I like to eat pizza)."
    } else if (question.includes("drink") || question.includes("beber")) {
      aiAnswer = "beber - This means 'to drink' in Spanish. Example: Voy a beber agua (I'm going to drink water)."
    } else if (question.includes("speak") || question.includes("hablar")) {
      aiAnswer =
        "hablar - This means 'to speak' or 'to talk' in Spanish. Example: Ella habla español (She speaks Spanish)."
    } else if (question.includes("run") || question.includes("correr")) {
      aiAnswer =
        "correr - This means 'to run' in Spanish. Example: Me gusta correr en el parque (I like to run in the park)."
    } else if (question.includes("write") || question.includes("escribir")) {
      aiAnswer =
        "escribir - This means 'to write' in Spanish. Example: Voy a escribir una carta (I'm going to write a letter)."
    } else {
      aiAnswer =
        "Based on your question, here's a comprehensive answer with context and examples to help you learn better."
    }

    setFormAnswer(aiAnswer)
    setIsGeneratingAnswer(false)

    toast({
      title: "Success",
      description: "AI answer generated successfully!",
    })
  }

  // Generate AI story
  const generateStory = async () => {
    if (flashcards.length === 0) {
      toast({
        title: "Error",
        description: "No flashcards available to generate a story",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingStory(true)

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock AI story generation
    const story = `Once upon a time, there was a young traveler named Maria who decided to visit Spain for the first time. 

On her first morning, she woke up hungry and decided to **comer** (eat) breakfast at a local café. The waiter approached her table, and she tried to **hablar** (speak) in Spanish. "Buenos días," she said nervously.

The waiter smiled and asked what she would like to **beber** (drink). Maria pointed to the menu and said "Café, por favor." She was proud that she could communicate, even with simple words.

After breakfast, Maria decided to explore the city. She loved to **correr** (run) in the mornings, so she jogged through the beautiful streets, taking in all the sights and sounds.

Later that evening, she sat in her hotel room and decided to **escribir** (write) in her journal about her amazing first day in Spain. She wrote about how using these simple Spanish verbs helped her connect with the local culture.

This story shows how the verbs **comer**, **hablar**, **beber**, **correr**, and **escribir** can be part of everyday adventures when learning Spanish!`

    setGeneratedStory(story)
    setIsGeneratingStory(false)
    setIsStoryDialogOpen(true)

    toast({
      title: "Success",
      description: "Story generated successfully!",
    })
  }

  // Open create dialog
  const openCreateDialog = () => {
    setFormQuestion("")
    setFormAnswer("")
    setIsCreateDialogOpen(true)
  }

  // Open edit dialog
  const openEditDialog = (flashcard: Flashcard) => {
    setCurrentFlashcard(flashcard)
    setFormQuestion(flashcard.question)
    setFormAnswer(flashcard.answer)
    setIsEditDialogOpen(true)
  }

  // Handle create flashcard
  const handleCreate = () => {
    if (!formQuestion.trim() || !formAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both question and answer",
        variant: "destructive",
      })
      return
    }

    const newFlashcard: Flashcard = {
      id: Date.now().toString(),
      question: formQuestion,
      answer: formAnswer,
      createdAt: new Date().toISOString().split("T")[0],
      needsReview: true,
      level: 1,
    }

    setFlashcards([...flashcards, newFlashcard])
    setIsCreateDialogOpen(false)
    setFormQuestion("")
    setFormAnswer("")

    toast({
      title: "Success",
      description: "Flashcard created successfully!",
    })
  }

  // Handle edit flashcard
  const handleEdit = () => {
    if (!currentFlashcard || !formQuestion.trim() || !formAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both question and answer",
        variant: "destructive",
      })
      return
    }

    const updatedFlashcards = flashcards.map((card) =>
      card.id === currentFlashcard.id ? { ...card, question: formQuestion, answer: formAnswer } : card,
    )

    setFlashcards(updatedFlashcards)
    setIsEditDialogOpen(false)
    setCurrentFlashcard(null)
    setFormQuestion("")
    setFormAnswer("")

    toast({
      title: "Success",
      description: "Flashcard updated successfully!",
    })
  }

  // Handle delete
  const handleDelete = (id: string) => {
    setFlashcards(flashcards.filter((card) => card.id !== id))
    setDeleteConfirmOpen(false)
    setFlashcardToDelete(null)

    toast({
      title: "Success",
      description: "Flashcard deleted successfully!",
    })
  }

  const openDeleteConfirm = (id: string) => {
    setFlashcardToDelete(id)
    setDeleteConfirmOpen(true)
  }

  // Get level tag color
  const getLevelColor = (level: number) => {
    if (level <= 2) {
      return "bg-yaralex-green/20 text-yaralex-green border-yaralex-green/30"
    } else if (level <= 4) {
      return "bg-yaralex-orange/20 text-yaralex-orange border-yaralex-orange/30"
    } else {
      return "bg-yaralex-red/20 text-yaralex-red border-yaralex-red/30"
    }
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.push("/flashcards")} className="p-2 hover:bg-white/10">
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{deck.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openCreateDialog}
            className="bg-yaralex-green hover:bg-yaralex-green/90 text-black font-bold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>
      </div>

      {/* Study Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card
          className="border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => router.push(`/flashcards/${deckId}/study`)}
        >
          <CardContent className="p-6 text-center">
            <Play className="h-8 w-8 text-yaralex-blue mx-auto mb-2" />
            <h3 className="font-bold text-white mb-1">Study Mode</h3>
            <p className="text-white/70 text-sm">Review all cards in order</p>
          </CardContent>
        </Card>

        <Card
          className="border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          onClick={generateStory}
        >
          <CardContent className="p-6 text-center">
            {isGeneratingStory ? (
              <Sparkles className="h-8 w-8 text-yaralex-purple mx-auto mb-2 animate-spin" />
            ) : (
              <BookOpen className="h-8 w-8 text-yaralex-purple mx-auto mb-2" />
            )}
            <h3 className="font-bold text-white mb-1">{isGeneratingStory ? "Generating..." : "AI Story"}</h3>
            <p className="text-white/70 text-sm">
              {isGeneratingStory ? "Creating story..." : "Generate story from cards"}
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => router.push(`/flashcards/${deckId}/quiz`)}
        >
          <CardContent className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-yaralex-green mx-auto mb-2" />
            <h3 className="font-bold text-white mb-1">AI Quiz</h3>
            <p className="text-white/70 text-sm">AI-generated quiz questions</p>
          </CardContent>
        </Card>
      </div>

      {/* Flashcards List */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Cards List</h2>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveFilter("all")}
            className={`ps-3 pe-1.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              activeFilter === "all" ? "bg-yaralex-green text-black" : "bg-[#1E2B31] text-white hover:bg-white/10"
            }`}
          >
            All
            <span
              className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                activeFilter === "all" ? "bg-black/20 text-black" : "bg-white/20 text-white"
              }`}
            >
              {flashcards.length}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter("learned")}
            className={`ps-3 pe-1.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              activeFilter === "learned" ? "bg-yaralex-green text-black" : "bg-[#1E2B31] text-white hover:bg-white/10"
            }`}
          >
            Learned
            <span
              className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                activeFilter === "learned" ? "bg-black/20 text-black" : "bg-white/20 text-white"
              }`}
            >
              {flashcards.filter((card) => !card.needsReview).length}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter("review")}
            className={`ps-3 pe-1.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              activeFilter === "review" ? "bg-yaralex-green text-black" : "bg-[#1E2B31] text-white hover:bg-white/10"
            }`}
          >
            Need to Review
            <span
              className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                activeFilter === "review" ? "bg-black/20 text-black" : "bg-white/20 text-white"
              }`}
            >
              {flashcards.filter((card) => card.needsReview).length}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(() => {
          // Filter cards based on active tab
          let filteredCards = flashcards
          if (activeFilter === "learned") {
            filteredCards = flashcards.filter((card) => !card.needsReview)
          } else if (activeFilter === "review") {
            filteredCards = flashcards.filter((card) => card.needsReview)
          }

          if (filteredCards.length === 0) {
            return (
              <div className="col-span-full">
                <Card className="border-2 border-white/10 bg-white/5">
                  <CardContent className="p-12 text-center">
                    {flashcards.length === 0 ? (
                      <>
                        <h3 className="text-xl font-bold text-white mb-2">No flashcards yet</h3>
                        <p className="text-white/70 mb-4">Create your first flashcard to get started</p>
                        <Button
                          onClick={openCreateDialog}
                          className="bg-yaralex-green hover:bg-yaralex-green/90 text-black font-bold"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Card
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-white mb-2">
                          No {activeFilter === "learned" ? "learned" : "cards to review"} cards
                        </h3>
                        <p className="text-white/70 mb-4">
                          {activeFilter === "learned"
                            ? "Start studying to mark cards as learned"
                            : "All cards have been learned! Great job!"}
                        </p>
                        <Button
                          onClick={() => setActiveFilter("all")}
                          className="bg-yaralex-blue hover:bg-yaralex-blue/90 text-white font-bold"
                        >
                          View All Cards
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          }

          return filteredCards.map((flashcard) => (
            <Card key={flashcard.id} className="border-2 border-white/10 bg-white/5 group relative">
              <CardContent className="p-4">
                {/* Action menu at top-right */}
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="sr-only">Open menu</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                        >
                          <path
                            d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(flashcard)}>
                        <Edit2 className="mr-2 h-3 w-3" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteConfirm(flashcard.id)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status and Level tags */}
                <div className="flex gap-2 mb-3">
                  {flashcard.needsReview ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yaralex-orange/20 text-yaralex-orange border border-yaralex-orange/30">
                      Need to Review
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yaralex-green/20 text-yaralex-green border border-yaralex-green/30">
                      Learned
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(flashcard.level)}`}
                  >
                    Level {flashcard.level}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 pr-8">{flashcard.question}</h3>
                <p className="text-xs text-white/80 mb-3 line-clamp-2">{flashcard.answer}</p>

                <div className="flex flex-col gap-1 text-xs text-white/50">
                  <span>Created: {flashcard.createdAt}</span>
                  {flashcard.lastStudied && <span>Last studied: {flashcard.lastStudied}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        })()}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-[#1E2B31] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="bg-[#131F24] border-white/10 text-white min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="answer">Answer</Label>
                <Button
                  type="button"
                  onClick={generateAnswer}
                  disabled={isGeneratingAnswer || !formQuestion.trim()}
                  className="bg-yaralex-blue hover:bg-yaralex-blue/90 text-white font-bold text-sm px-3 py-1 h-auto"
                >
                  {isGeneratingAnswer ? (
                    <>
                      <Sparkles className="mr-1 h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-3 w-3" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="answer"
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                placeholder="Enter the answer or generate with AI..."
                className="bg-[#131F24] border-white/10 text-white min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleCreate} className="bg-yaralex-green hover:bg-yaralex-green/90 text-black font-bold">
              Create Flashcard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1E2B31] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-question">Question</Label>
              <Textarea
                id="edit-question"
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="bg-[#131F24] border-white/10 text-white min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-answer">Answer</Label>
                <Button
                  type="button"
                  onClick={generateAnswer}
                  disabled={isGeneratingAnswer || !formQuestion.trim()}
                  className="bg-yaralex-blue hover:bg-yaralex-blue/90 text-white font-bold text-sm px-3 py-1 h-auto"
                >
                  {isGeneratingAnswer ? (
                    <>
                      <Sparkles className="mr-1 h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-3 w-3" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="edit-answer"
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                placeholder="Enter the answer or generate with AI..."
                className="bg-[#131F24] border-white/10 text-white min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleEdit} className="bg-yaralex-green hover:bg-yaralex-green/90 text-black font-bold">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Story Dialog */}
      <Dialog open={isStoryDialogOpen} onOpenChange={setIsStoryDialogOpen}>
        <DialogContent className="bg-[#1E2B31] border-white/10 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              AI Generated Story
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-line text-white/90 leading-relaxed">{generatedStory}</div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="bg-yaralex-green hover:bg-yaralex-green/90 text-black font-bold">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#1E2B31] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Flashcard</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this flashcard? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => flashcardToDelete && handleDelete(flashcardToDelete)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
