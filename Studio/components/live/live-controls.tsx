"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Video, Mic, MicOff, VideoOff, Share2, Settings, Users } from "lucide-react"

interface LiveControlsProps {
  isLive: boolean
  onToggleLive: () => void
}

export function LiveControls({ isLive, onToggleLive }: LiveControlsProps) {
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [selectedCamera, setSelectedCamera] = useState("default")
  const [selectedMic, setSelectedMic] = useState("default")

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Stream Controls</CardTitle>
            <CardDescription>Configure your stream settings</CardDescription>
          </div>
          <Button variant={isLive ? "destructive" : "default"} className="px-6" onClick={onToggleLive}>
            {isLive ? "End Stream" : "Go Live"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                <Label htmlFor="video-toggle">Video</Label>
              </div>
              <Switch id="video-toggle" checked={videoEnabled} onCheckedChange={setVideoEnabled} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="camera-select">Camera</Label>
              <Select value={selectedCamera} onValueChange={setSelectedCamera} disabled={!videoEnabled}>
                <SelectTrigger id="camera-select">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Camera</SelectItem>
                  <SelectItem value="webcam">Webcam</SelectItem>
                  <SelectItem value="external">External Camera</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                <Label htmlFor="audio-toggle">Audio</Label>
              </div>
              <Switch id="audio-toggle" checked={audioEnabled} onCheckedChange={setAudioEnabled} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mic-select">Microphone</Label>
              <Select value={selectedMic} onValueChange={setSelectedMic} disabled={!audioEnabled}>
                <SelectTrigger id="mic-select">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Microphone</SelectItem>
                  <SelectItem value="headset">Headset Mic</SelectItem>
                  <SelectItem value="external">External Mic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Link
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced Settings
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Invite Students
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
