"use client"

import {
  MessageSquare,
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  HandIcon as HandRaised,
  Settings,
  HelpCircle,
} from "lucide-react"
import { useState } from "react"

interface LiveFooterProps {
  showChat: boolean
  showParticipants: boolean
  showQuestions: boolean
  toggleChat: () => void
  toggleParticipants: () => void
  toggleQuestions: () => void
}

export function LiveFooter({
  showChat,
  showParticipants,
  showQuestions,
  toggleChat,
  toggleParticipants,
  toggleQuestions,
}: LiveFooterProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoOff, setIsVideoOff] = useState(true)
  const [isHandRaised, setIsHandRaised] = useState(false)

  return (
    <div className="border-t border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          {/* Settings button moved to the left */}
          <button
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Mic toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-full ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Video toggle */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-2 rounded-full ${isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          {/* Raise hand */}
          <button
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`p-2 rounded-full ${isHandRaised ? "bg-yaralex-yellow text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
            aria-label={isHandRaised ? "Lower hand" : "Raise hand"}
            title={isHandRaised ? "Lower hand" : "Raise hand"}
          >
            <HandRaised size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Chat toggle */}
          <button
            onClick={toggleChat}
            className={`p-2 rounded-full ${showChat ? "bg-yaralex-green text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
            aria-label="Toggle chat"
            title="Toggle chat"
          >
            <MessageSquare size={20} />
          </button>

          {/* Questions toggle - new button */}
          <button
            onClick={toggleQuestions}
            className={`p-2 rounded-full ${showQuestions ? "bg-yaralex-green text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
            aria-label="Toggle questions"
            title="Toggle questions"
          >
            <HelpCircle size={20} />
          </button>

          {/* Participants toggle */}
          <button
            onClick={toggleParticipants}
            className={`p-2 rounded-full ${showParticipants ? "bg-yaralex-green text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
            aria-label="Toggle participants"
            title="Toggle participants"
          >
            <Users size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
