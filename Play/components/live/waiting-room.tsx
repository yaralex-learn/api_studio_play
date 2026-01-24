"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface WaitingRoomProps {
  session: {
    title: string
    instructor: {
      name: string
      avatar: string
    }
    startTime: Date
    description?: string
  }
  onSessionStart: () => void
}

export function WaitingRoom({ session, onSessionStart }: WaitingRoomProps) {
  const [timeUntilStart, setTimeUntilStart] = useState("")
  const [isStartingSoon, setIsStartingSoon] = useState(false)

  // Calculate and update time until session starts
  useEffect(() => {
    const updateTimeUntilStart = () => {
      const now = new Date()
      const diffMs = session.startTime.getTime() - now.getTime()

      if (diffMs <= 0) {
        setTimeUntilStart("Starting now...")
        setIsStartingSoon(true)
        return
      }

      const diffMins = Math.floor(diffMs / 60000)
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60

      if (hours === 0 && mins <= 5) {
        setIsStartingSoon(true)
      }

      setTimeUntilStart(`${hours > 0 ? `${hours}h ` : ""}${mins}m until start`)
    }

    updateTimeUntilStart()
    const interval = setInterval(updateTimeUntilStart, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [session.startTime])

  // Auto-start session after a delay if it's starting soon
  useEffect(() => {
    if (isStartingSoon) {
      const timer = setTimeout(() => {
        onSessionStart()
      }, 5000) // Start after 5 seconds for demo purposes

      return () => clearTimeout(timer)
    }
  }, [isStartingSoon, onSessionStart])

  return (
    <div className="min-h-screen bg-yaralex-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-[#1E2B31] rounded-xl p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">{session.title}</h1>

          <div className="flex justify-center mb-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                <Image
                  src={session.instructor.avatar || "/placeholder.svg"}
                  alt={session.instructor.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <p className="text-white font-medium">{session.instructor.name}</p>
              <p className="text-white/60 text-sm">Instructor</p>
            </div>
          </div>

          {session.description && <p className="text-white/80 mb-8">{session.description}</p>}

          <div className={`mb-8 p-4 rounded-lg ${isStartingSoon ? "bg-yaralex-green/20" : "bg-white/10"}`}>
            <p className={`text-lg font-bold ${isStartingSoon ? "text-yaralex-green" : "text-white"}`}>
              {timeUntilStart}
            </p>
          </div>

          <Button
            onClick={onSessionStart}
            className="bg-yaralex-green hover:bg-yaralex-green/90 text-black font-bold px-8 py-6 text-lg rounded-xl"
          >
            {isStartingSoon ? "Join Now" : "Join Waiting Room"}
          </Button>

          {!isStartingSoon && (
            <p className="mt-4 text-white/60 text-sm">You'll be automatically joined when the session begins.</p>
          )}
        </div>
      </div>
    </div>
  )
}
