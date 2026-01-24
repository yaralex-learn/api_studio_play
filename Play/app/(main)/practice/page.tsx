"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChannelSelector } from "@/components/channel-selector"
import { MistakeList } from "@/components/mistake-list"
import { CountBar } from "@/components/count-bar"
import { useRouter } from "next/navigation"

// Mock channels data
const mockChannels = [
  {
    id: 1,
    name: "Spanish Beginners",
    image: "/images/spanish-flag.png",
  },
  {
    id: 2,
    name: "French Essentials",
    image: "/blue-abstract-flow.png",
  },
  {
    id: 3,
    name: "German Basics",
    image: "/elemental-bending.png",
  },
  {
    id: 4,
    name: "Italian for Travel",
    image: "/bioluminescent-forest.png",
  },
]

// Mock practice data with mistakes
const practiceData = [
  {
    id: 1,
    title: "Listening",
    description: "Practice your listening skills",
    color: "bg-yaralex-orange",
    completed: 24,
    total: 30,
    mistakes: [
      {
        id: "m1",
        text: "Yo tengo un gato negro",
        correction: "Yo tengo un gato negro (I have a black cat)",
        date: "2 days ago",
      },
      {
        id: "m2",
        text: "El hombre está comiendo",
        correction: "El hombre está comiendo (The man is eating)",
        date: "3 days ago",
      },
      {
        id: "m3",
        text: "Ella va al supermercado",
        correction: "Ella va al supermercado (She goes to the supermarket)",
        date: "5 days ago",
      },
    ],
  },
  {
    id: 2,
    title: "Speaking",
    description: "Practice your pronunciation",
    color: "bg-yaralex-blue",
    completed: 18,
    total: 30,
    mistakes: [
      {
        id: "m4",
        text: "Buenos días",
        correction: "Buenos días (Good morning) - Pronunciation: stress on 'dí'",
        date: "1 day ago",
      },
      {
        id: "m5",
        text: "Gracias",
        correction: "Gracias (Thank you) - Pronunciation: softer 'c' sound",
        date: "2 days ago",
      },
      {
        id: "m6",
        text: "Biblioteca",
        correction: "Biblioteca (Library) - Pronunciation: stress on 'te'",
        date: "4 days ago",
      },
      {
        id: "m7",
        text: "Ferrocarril",
        correction: "Ferrocarril (Railway) - Pronunciation: roll the 'rr'",
        date: "6 days ago",
      },
      {
        id: "m8",
        text: "Desarrollo",
        correction: "Desarrollo (Development) - Pronunciation: stress on 'rro'",
        date: "1 week ago",
      },
    ],
  },
  {
    id: 3,
    title: "Reading",
    description: "Improve your reading comprehension",
    color: "bg-yaralex-green",
    completed: 30,
    total: 30,
    mistakes: [
      {
        id: "m16",
        text: "El libro está en la biblioteca",
        correction: "El libro está en la biblioteca (The book is in the library)",
        date: "1 day ago",
      },
      {
        id: "m17",
        text: "No entiendo este párrafo",
        correction: "No entiendo este párrafo (I don't understand this paragraph)",
        date: "3 days ago",
      },
      {
        id: "m18",
        text: "La historia es interesante",
        correction: "La historia es interesante (The story is interesting)",
        date: "4 days ago",
      },
    ],
  },
  {
    id: 4,
    title: "Writing",
    description: "Practice writing sentences",
    color: "bg-yaralex-purple",
    completed: 12,
    total: 30,
    mistakes: [
      {
        id: "m9",
        text: "Yo soy estudiante de español",
        correction: "Yo soy estudiante de español (I am a Spanish student)",
        date: "3 days ago",
      },
      {
        id: "m10",
        text: "Me gusta la música",
        correction: "Me gusta la música (I like music)",
        date: "5 days ago",
      },
    ],
  },
  {
    id: 5,
    title: "Vocabulary",
    description: "Expand your vocabulary",
    color: "bg-yaralex-yellow",
    completed: 20,
    total: 30,
    mistakes: [
      {
        id: "m11",
        text: "La mesa - The table",
        correction: "La mesa - The table",
        date: "1 day ago",
      },
      {
        id: "m12",
        text: "El perro - The cat",
        correction: "El perro - The dog (not cat)",
        date: "2 days ago",
      },
      {
        id: "m13",
        text: "Azul - Blue",
        correction: "Azul - Blue",
        date: "4 days ago",
      },
    ],
  },
  {
    id: 6,
    title: "Grammar",
    description: "Master grammar rules",
    color: "bg-yaralex-red",
    completed: 15,
    total: 30,
    mistakes: [
      {
        id: "m14",
        text: "Yo hablo español",
        correction: "Yo hablo español (I speak Spanish)",
        date: "2 days ago",
      },
      {
        id: "m15",
        text: "Ella es bonita",
        correction: "Ella es bonita (She is pretty)",
        date: "3 days ago",
      },
    ],
  },
]

export default function PracticePage() {
  const [selectedChannel, setSelectedChannel] = useState(mockChannels[0])
  const router = useRouter()

  const handleStartPractice = (practiceId: number) => {
    router.push(`/practice/${practiceId}`)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Practice Skills</h1>
        <ChannelSelector
          channels={mockChannels}
          selectedChannel={selectedChannel}
          onChannelChange={setSelectedChannel}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {practiceData.map((practice) => (
          <Card key={practice.id} className="overflow-hidden border-2 border-white/10 bg-white/5">
            <div className={`h-2 w-full ${practice.color}`} />
            <CardContent className="p-6">
              <h3 className="mb-1 text-xl font-bold text-white">{practice.title}</h3>
              <p className="mb-4 text-sm text-white/70">{practice.description}</p>

              {/* Count bar */}
              <CountBar
                completed={practice.completed}
                total={practice.total}
                color={
                  practice.color === "bg-yaralex-orange"
                    ? "#FF9600"
                    : practice.color === "bg-yaralex-blue"
                      ? "#1CB0F6"
                      : practice.color === "bg-yaralex-green"
                        ? "#58CC02"
                        : practice.color === "bg-yaralex-purple"
                          ? "#A560E8"
                          : practice.color === "bg-yaralex-yellow"
                            ? "#FFDE00"
                            : practice.color === "bg-yaralex-red"
                              ? "#FF4B4B"
                              : "#58CC02"
                }
                className="mb-4"
              />

              <Button
                className={`w-full ${practice.color} hover:opacity-90 text-black font-bold mb-4`}
                onClick={() => handleStartPractice(practice.id)}
              >
                Start Practice
              </Button>

              {/* Recent mistakes section */}
              <div className="mt-4 border-t border-white/10 pt-4">
                <h4 className="text-sm font-medium text-white/70 mb-3">Last 3 Mistakes</h4>
                <MistakeList mistakes={practice.mistakes.slice(0, 3)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
