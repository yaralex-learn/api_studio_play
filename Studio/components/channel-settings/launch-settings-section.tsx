"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"

export function LaunchSettingsSection() {
  const [targetGroup, setTargetGroup] = useState("")
  const [isLaunched, setIsLaunched] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)

  const handleSave = () => {
    console.log("Saving launch settings...")
    // Implement actual save logic here
  }

  const handleLaunch = async () => {
    if (!targetGroup) return

    setIsLaunching(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLaunching(false)
    setIsLaunched(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">Launch Settings</h3>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-group" className="font-medium">
            Target Group
          </Label>
          <Select value={targetGroup} onValueChange={setTargetGroup}>
            <SelectTrigger id="target-group">
              <SelectValue placeholder="Select target group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="early-access">Early Access Members</SelectItem>
              <SelectItem value="beta-testers">Beta Testers</SelectItem>
              <SelectItem value="premium">Premium Members</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Choose which group of users will have access to your channel.</p>
        </div>
      </div>
    </div>
  )
}
