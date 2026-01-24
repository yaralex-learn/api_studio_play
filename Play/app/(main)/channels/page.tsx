"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Users, Star, BookOpen, Target, Play, HelpCircle, FileText } from "lucide-react"

// Mock channel data
const mockChannels = [
  {
    id: 1,
    name: "Spanish Beginners",
    description: "Learn the basics of Spanish language",
    image: "/diverse-group-meeting.png",
    members: 1245,
    instructor: "Prof. Maria Rodriguez",
    isLive: true,
    isFeatured: true,
    sections: 4,
    units: 12,
    steps: 48,
    lessons: 32,
    quizzes: 16,
  },
  {
    id: 2,
    name: "Spanish Grammar",
    description: "Master Spanish grammar rules and structures",
    image: "/blue-abstract-flow.png",
    members: 876,
    instructor: "David Chen",
    isLive: false,
    isFeatured: false,
    sections: 6,
    units: 18,
    steps: 72,
    lessons: 48,
    quizzes: 24,
  },
  {
    id: 3,
    name: "Conversation Practice",
    description: "Practice everyday Spanish conversations",
    image: "/elemental-bending.png",
    members: 1032,
    instructor: "Emma S.",
    isLive: false,
    isFeatured: true,
    sections: 3,
    units: 9,
    steps: 36,
    lessons: 24,
    quizzes: 12,
  },
  {
    id: 4,
    name: "Spanish Literature",
    description: "Explore famous Spanish literary works",
    image: "/bioluminescent-forest.png",
    members: 543,
    instructor: "Carlos M.",
    isLive: false,
    isFeatured: false,
    sections: 8,
    units: 24,
    steps: 96,
    lessons: 64,
    quizzes: 32,
  },
  {
    id: 5,
    name: "Spanish for Travel",
    description: "Essential Spanish phrases for travelers",
    image: "/diverse-group-meeting.png",
    members: 1567,
    instructor: "Sophie L.",
    isLive: false,
    isFeatured: false,
    sections: 5,
    units: 15,
    steps: 60,
    lessons: 40,
    quizzes: 20,
  },
]

// Channel categories
const categories = ["All Channels", "Featured", "Live Now", "My Channels"]

export default function ChannelsPage() {
  const [activeCategory, setActiveCategory] = useState("All Channels")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter channels based on active category and search query
  const filteredChannels = mockChannels.filter((channel) => {
    // Filter by category
    if (activeCategory === "Featured" && !channel.isFeatured) return false
    if (activeCategory === "Live Now" && !channel.isLive) return false
    if (activeCategory === "My Channels") return true // Assuming all are subscribed for demo

    // Filter by search query
    if (
      searchQuery &&
      !channel.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !channel.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    return true
  })

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Channels</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1E2B31] border border-white/10 rounded-full pl-10 pr-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yaralex-green w-full md:w-64"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category ? "bg-yaralex-green text-black" : "bg-[#1E2B31] text-white hover:bg-white/10"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Channels grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredChannels.map((channel) => (
          <Link href={`/learn/section/1`} key={channel.id}>
            <Card className="overflow-hidden border-2 border-white/10 bg-[#1E2B31] hover:border-white/20 transition-colors">
              <div className="relative h-40 w-full">
                <Image src={channel.image || "/placeholder.svg"} alt={channel.name} fill className="object-cover" />
                {channel.isLive && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    LIVE
                  </div>
                )}
                {channel.isFeatured && (
                  <div className="absolute top-3 left-3 bg-yaralex-yellow text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    FEATURED
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-white mb-1">{channel.name}</h3>
                <p className="text-white/70 text-sm mb-4">{channel.description}</p>

                {/* Channel metrics */}
                <div className="flex flex-row flex-wrap gap-4 text-xs mb-4">
                  <div className="flex items-center text-white/60">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {channel.sections} Sections
                  </div>
                  <div className="flex items-center text-white/60">
                    <Target className="h-3 w-3 mr-1" />
                    {channel.units} Units
                  </div>
                  <div className="flex items-center text-white/60">
                    <Play className="h-3 w-3 mr-1" />
                    {channel.steps} Steps
                  </div>
                  <div className="flex items-center text-white/60">
                    <FileText className="h-3 w-3 mr-1" />
                    {channel.lessons} Lessons
                  </div>
                  <div className="flex items-center text-white/60">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    {channel.quizzes} Quizzes
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yaralex-green flex items-center justify-center text-xs font-bold text-black">
                      {channel.instructor.charAt(0)}
                    </div>
                    <p className="text-white/80 text-sm">
                      <span className="text-white">{channel.instructor}</span>
                    </p>
                  </div>
                  <div className="flex items-center text-white/60 text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {channel.members.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
