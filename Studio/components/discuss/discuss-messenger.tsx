"use client"

import { useState, useEffect } from "react"
import { ChannelList } from "./channel-list"
import { ChatArea } from "./chat-area"
import { cn } from "@/lib/utils"
import type { Channel, Message, Student } from "./types"
import { mockChannels, mockStudents } from "./mock-data"
import { CollapsibleSection } from "./collapsible-section"
import { StudentList } from "./student-list"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function DiscussMessenger() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [showChannelList, setShowChannelList] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Load mock data
  useEffect(() => {
    setChannels(mockChannels)
    setStudents(mockStudents)

    // Select the first channel by default
    if (mockChannels.length > 0) {
      setSelectedChannel(mockChannels[0])
    }

    // Check if mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)

    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  // Filter both channels and students based on search query
  const filteredChannels = channels.filter((channel) => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Handle channel selection
  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel)
    setSelectedStudent(null)
    if (isMobile) {
      setShowChannelList(false)
    }
  }

  // Handle student selection
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
    setSelectedChannel(null)
    if (isMobile) {
      setShowChannelList(false)
    }
  }

  // Handle sending a new message
  const handleSendMessage = (content: string) => {
    if (selectedChannel) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: new Date(),
        status: "sent",
      }

      // Update the channel with the new message
      setChannels(
        channels.map((channel) =>
          channel.id === selectedChannel.id
            ? {
                ...channel,
                messages: [...channel.messages, newMessage],
                lastMessage: newMessage,
              }
            : channel,
        ),
      )

      // Update the selected channel
      setSelectedChannel({
        ...selectedChannel,
        messages: [...selectedChannel.messages, newMessage],
        lastMessage: newMessage,
      })
    } else if (selectedStudent) {
      // Handle sending message to a student
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        sender: {
          id: "instructor",
          name: "Instructor",
          avatar: "/diverse-classroom-instructor.png",
        },
        timestamp: new Date(),
        status: "sent",
      }

      // Update the student with the new message
      setStudents(
        students.map((student) =>
          student.id === selectedStudent.id
            ? {
                ...student,
                messages: [...student.messages, newMessage],
                lastMessage: newMessage,
              }
            : student,
        ),
      )

      // Update the selected student
      setSelectedStudent({
        ...selectedStudent,
        messages: [...selectedStudent.messages, newMessage],
        lastMessage: newMessage,
      })
    }
  }

  // Toggle channel list visibility on mobile
  const toggleChannelList = () => {
    setShowChannelList(!showChannelList)
  }

  return (
    <div className="flex w-full h-full overflow-hidden bg-background">
      {/* Channel list - hidden on mobile when a channel is selected */}
      <div
        className={cn(
          "border-r w-full md:w-80 md:max-w-xs flex-shrink-0 bg-background flex flex-col",
          isMobile && !showChannelList && "hidden",
        )}
      >
        {/* Add search box at the top of the sidebar */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search channels and students"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <CollapsibleSection title="Channels" defaultExpanded={true}>
            <ChannelList
              channels={filteredChannels}
              selectedChannel={selectedChannel}
              onSelectChannel={handleSelectChannel}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Students" defaultExpanded={true}>
            <StudentList
              students={filteredStudents}
              selectedStudent={selectedStudent}
              onSelectStudent={handleSelectStudent}
            />
          </CollapsibleSection>
        </div>
      </div>

      {/* Chat area - hidden on mobile when showing channel list */}
      <div className={cn("flex-1", isMobile && showChannelList && "hidden")}>
        <ChatArea
          channel={selectedChannel}
          student={selectedStudent}
          students={students}
          onSendMessage={handleSendMessage}
          onBackClick={isMobile ? toggleChannelList : undefined}
        />
      </div>
    </div>
  )
}
