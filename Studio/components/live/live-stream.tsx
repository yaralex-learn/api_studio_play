"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Video, Users } from "lucide-react"

interface LiveStreamProps {
  isLive: boolean
}

export function LiveStream({ isLive }: LiveStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // In a real implementation, this would connect to a streaming service
  useEffect(() => {
    if (isLive && videoRef.current) {
      // Simulate a live stream with the user's camera
      navigator.mediaDevices
        ?.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err)
        })

      return () => {
        // Clean up the stream when component unmounts or stream ends
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
          tracks.forEach((track) => track.stop())
        }
      }
    }
  }, [isLive])

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        {isLive ? (
          <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video bg-black object-cover" />
        ) : (
          <div className="w-full aspect-video bg-black flex items-center justify-center text-white">
            <div className="text-center">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Stream Preview</p>
              <p className="text-sm text-gray-400">Click "Go Live" to start streaming</p>
            </div>
          </div>
        )}

        {isLive && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>
        )}

        {isLive && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>24 Viewers</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
