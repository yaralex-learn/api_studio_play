"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { MdColorize } from "react-icons/md"
import Link from "next/link"
import { ChannelSelector } from "@/components/channel-selector"

// Define the flashcard deck type
interface FlashcardDeck {
  id: string
  title: string
  count: string
  color: string
}

export default function FlashcardsPage() {
  // Initial flashcard decks
  const initialDecks: FlashcardDeck[] = [
    { id: "1", title: "Common Verbs", count: "50 cards", color: "bg-yaralex-yellow" },
    { id: "2", title: "Food & Drinks", count: "40 cards", color: "bg-yaralex-orange" },
    { id: "3", title: "Travel Phrases", count: "35 cards", color: "bg-yaralex-blue" },
    { id: "4", title: "Numbers", count: "25 cards", color: "bg-yaralex-green" },
    { id: "5", title: "Adjectives", count: "45 cards", color: "bg-yaralex-purple" },
    { id: "6", title: "Daily Routines", count: "30 cards", color: "bg-yaralex-red" },
  ]

  // State for flashcard decks
  const [decks, setDecks] = useState<FlashcardDeck[]>(initialDecks)

  // State for the create/edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState("")
  const [formCount, setFormCount] = useState("")
  const [formColor, setFormColor] = useState("bg-yaralex-yellow")

  // Add this after the existing form state
  const [isCustomColor, setIsCustomColor] = useState(false)
  const [customColorValue, setCustomColorValue] = useState("#f4845f") // Add this line

  // Mock channels data - these are the learning community channels
  const channels = [
    { id: 1, name: "Beginners Hub", image: "/placeholder.svg?height=24&width=24&text=BH" },
    { id: 2, name: "Grammar Masters", image: "/placeholder.svg?height=24&width=24&text=GM" },
    { id: 3, name: "Conversation Club", image: "/placeholder.svg?height=24&width=24&text=CC" },
    { id: 4, name: "Study Buddies", image: "/placeholder.svg?height=24&width=24&text=SB" },
    { id: 5, name: "Advanced Learners", image: "/placeholder.svg?height=24&width=24&text=AL" },
  ]

  const [selectedChannel, setSelectedChannel] = useState(channels[0])

  // Available colors
  const colorOptions = [
    { name: "Yellow", value: "bg-yaralex-yellow" },
    { name: "Orange", value: "bg-yaralex-orange" },
    { name: "Blue", value: "bg-yaralex-blue" },
    { name: "Green", value: "bg-yaralex-green" },
    { name: "Purple", value: "bg-yaralex-purple" },
    { name: "Red", value: "bg-yaralex-red" },
  ]

  // Open dialog to create a new deck
  const openCreateDialog = () => {
    setIsEditMode(false)
    setCurrentDeck(null)
    setFormTitle("")
    setFormCount("0 cards")
    setFormColor("bg-yaralex-yellow")
    setIsCustomColor(false)
    setCustomColorValue("#f4845f") // Add this line
    setIsDialogOpen(true)
  }

  // Open dialog to edit an existing deck
  const openEditDialog = (deck: FlashcardDeck) => {
    setIsEditMode(true)
    setCurrentDeck(deck)
    setFormTitle(deck.title)
    setFormCount(deck.count)
    setFormColor(deck.color)
    // Check if the color is a custom color (starts with bg-[#)
    const isCustom = deck.color.startsWith("bg-[#")
    setIsCustomColor(isCustom)
    if (isCustom) {
      // Extract hex color from bg-[#hexcolor] format
      const hexMatch = deck.color.match(/bg-\[#([a-fA-F0-9]{6})\]/)
      if (hexMatch) {
        setCustomColorValue(`#${hexMatch[1]}`)
      }
    } else {
      setCustomColorValue("#f4845f")
    }
    setIsDialogOpen(true)
  }

  // Handle form submission
  const handleSubmit = () => {
    if (!formTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the flashcard deck",
        variant: "destructive",
      })
      return
    }

    if (isEditMode && currentDeck) {
      // Update existing deck
      const updatedDecks = decks.map((deck) =>
        deck.id === currentDeck.id ? { ...deck, title: formTitle, color: formColor } : deck,
      )
      setDecks(updatedDecks)
      toast({
        title: "Success",
        description: "Flashcard deck updated successfully",
      })
    } else {
      // Create new deck
      const newDeck: FlashcardDeck = {
        id: Date.now().toString(),
        title: formTitle,
        count: "0 cards", // Default for new decks
        color: formColor,
      }
      setDecks((prevDecks) => [...prevDecks, newDeck])
      toast({
        title: "Success",
        description: "New flashcard deck created successfully",
      })
    }

    setIsDialogOpen(false)
  }

  // Delete a deck
  const handleDelete = (id: string) => {
    setDecks(decks.filter((deck) => deck.id !== id))
    toast({
      title: "Success",
      description: "Flashcard deck deleted successfully",
    })
  }

  // Confirm delete dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null)

  const openDeleteConfirm = (id: string) => {
    setDeckToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (deckToDelete) {
      handleDelete(deckToDelete)
      setDeleteConfirmOpen(false)
      setDeckToDelete(null)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Flashcard Decks</h1>
        <div className="flex items-center gap-4">
          <ChannelSelector channels={channels} selectedChannel={selectedChannel} onChannelChange={setSelectedChannel} />
          <Button
            onClick={openCreateDialog}
            className="bg-yaralex-green hover:bg-yaralex-green/90 text-black font-bold"
          >
            <Plus className="mr-2 h-4 w-4" /> New Deck
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <Card key={deck.id} className="overflow-hidden border-2 border-white/10 bg-white/5 group">
            <div className={`h-2 w-full ${deck.color}`} />
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold text-white">{deck.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="sr-only">Open menu</span>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                    <DropdownMenuItem onClick={() => openEditDialog(deck)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteConfirm(deck.id)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mb-4 text-sm text-white/70">{deck.count}</p>
              <Link href={`/flashcards/${deck.id}`}>
                <Button className={`w-full ${deck.color} hover:opacity-90 text-black font-bold`}>Study</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1E2B31] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Flashcard Deck" : "Create New Flashcard Deck"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Deck Title</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter deck title"
                className="bg-[#131F24] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Deck Color</Label>
              <div className="flex flex-wrap items-center gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      setFormColor(color.value)
                      setIsCustomColor(false) // Add this line
                    }}
                    className={`w-8 h-8 rounded-full ${color.value} ${
                      formColor === color.value && !isCustomColor ? "ring-2 ring-white" : "ring-0 ring-transparent"
                    }`}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
                {/* Custom color picker with clickable circle */}
                <div className="relative pb-[2px]">
                  {/* Hidden color input */}
                  <input
                    ref={(input) => {
                      if (input) {
                        input.style.display = "none"
                      }
                    }}
                    type="color"
                    value={customColorValue}
                    onChange={(e) => {
                      const hexColor = e.target.value
                      setCustomColorValue(hexColor)
                      setFormColor(`bg-[${hexColor}]`)
                      setIsCustomColor(true)
                    }}
                    id="custom-color-picker"
                  />
                  {/* Clickable circle */}
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("custom-color-picker") as HTMLInputElement
                      if (input) input.click()
                    }}
                    className={`w-8 h-8 rounded-full cursor-pointer relative overflow-hidden ${
                      isCustomColor ? "ring-2 ring-white" : "ring-0 ring-transparent"
                    }`}
                    style={{
                      backgroundColor: customColorValue,
                    }}
                    title="Choose custom color"
                  >
                    {/* Icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <MdColorize
                        size={19}
                        style={{
                          color: isCustomColor
                            ? // Calculate if the color is light or dark to choose appropriate icon color
                              Number.parseInt(customColorValue.slice(1, 3), 16) * 0.299 +
                                Number.parseInt(customColorValue.slice(3, 5), 16) * 0.587 +
                                Number.parseInt(customColorValue.slice(5, 7), 16) * 0.114 >
                              186
                              ? "#000000"
                              : "#ffffff"
                            : "#ffffff",
                        }}
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit} className="bg-yaralex-green hover:bg-yaralex-green/90 text-black font-bold">
              {isEditMode ? "Save Changes" : "Create Deck"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#1E2B31] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Flashcard Deck</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this flashcard deck? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
