"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiveControls } from "./live-controls"
import { LiveStream } from "./live-stream"
import { LiveQuestions } from "./live-questions"
import { LiveAnalytics } from "./live-analytics"
import { LiveChat } from "./live-chat"
import { Card } from "@/components/ui/card"

export function LiveDashboard() {
  const [isLive, setIsLive] = useState(false)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Stream and Controls */}
        <div className="lg:col-span-2 space-y-6">
          <LiveControls isLive={isLive} onToggleLive={() => setIsLive(!isLive)} />
          <LiveStream isLive={isLive} />

          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="questions">
              <Card className="p-4">
                <LiveQuestions
                  isLive={isLive}
                  activeQuestionId={activeQuestionId}
                  onActivateQuestion={setActiveQuestionId}
                />
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <Card className="p-4">
                <LiveAnalytics />
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Chat and Participants */}
        <div>
          <LiveChat isLive={isLive} />
        </div>
      </div>
    </div>
  )
}
