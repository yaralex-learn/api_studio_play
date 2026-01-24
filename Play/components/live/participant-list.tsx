"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp } from "lucide-react"

// Mock participant data
const participants = {
  instructors: [
    {
      id: "instructor1",
      name: "Prof. Maria Rodriguez",
      avatar: "/diverse-group-meeting.png",
      role: "instructor",
      online: true,
    },
  ],
  assistants: [
    {
      id: "assistant1",
      name: "David Chen",
      avatar: "/blue-abstract-flow.png",
      role: "assistant",
      online: true,
    },
  ],
  students: [
    {
      id: "student1",
      name: "Emma S.",
      avatar: "/elemental-bending.png",
      role: "student",
      online: true,
    },
    {
      id: "student2",
      name: "Carlos M.",
      avatar: "/bioluminescent-forest.png",
      role: "student",
      online: true,
    },
    {
      id: "student3",
      name: "Sophie L.",
      avatar: "/diverse-group-meeting.png",
      role: "student",
      online: true,
    },
    {
      id: "student4",
      name: "Aiden T.",
      avatar: "/diverse-group-meeting.png",
      role: "student",
      online: true,
    },
    {
      id: "student5",
      name: "Olivia P.",
      avatar: "/diverse-group-meeting.png",
      role: "student",
      online: false,
    },
    {
      id: "student6",
      name: "Noah K.",
      avatar: "/blue-abstract-flow.png",
      role: "student",
      online: true,
    },
    {
      id: "student7",
      name: "Isabella R.",
      avatar: "/blue-abstract-flow.png",
      role: "student",
      online: true,
    },
    {
      id: "currentUser",
      name: "Language Learner",
      avatar: "/abstract-user-icon.png",
      role: "student",
      online: true,
      isCurrentUser: true,
    },
  ],
}

export function ParticipantList() {
  const [expandedSections, setExpandedSections] = useState({
    instructors: true,
    assistants: true,
    students: true,
  })

  const totalParticipants =
    participants.instructors.length + participants.assistants.length + participants.students.length

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  const renderParticipantGroup = (title: string, participants: any[], section: keyof typeof expandedSections) => {
    if (participants.length === 0) return null

    return (
      <div>
        <button
          onClick={() => toggleSection(section)}
          className="flex items-center justify-between w-full p-3 text-white hover:bg-white/5"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            <span className="text-sm text-gray-400">({participants.length})</span>
          </div>
          {expandedSections[section] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expandedSections[section] && (
          <div className="space-y-1 pl-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`flex items-center gap-3 p-2 rounded-md ${participant.isCurrentUser ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={participant.avatar || "/placeholder.svg"}
                      alt={participant.name}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  {participant.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#131F24]"></div>
                  )}
                </div>
                <span className={`${participant.isCurrentUser ? "font-medium" : ""} text-white`}>
                  {participant.name} {participant.isCurrentUser && "(You)"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#131F24] overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">Participants ({totalParticipants})</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderParticipantGroup("Instructors", participants.instructors, "instructors")}
        {renderParticipantGroup("Teaching Assistants", participants.assistants, "assistants")}
        {renderParticipantGroup("Students", participants.students, "students")}
      </div>
    </div>
  )
}
