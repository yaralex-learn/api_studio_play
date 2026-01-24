"use client"

import { Check } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Channel {
  id: number
  name: string
  image: string
}

interface ChannelSelectorProps {
  channels: Channel
  selectedChannel: Channel
  onChannelChange: (channel: Channel) => void
}

export function ChannelSelector({ channels, selectedChannel, onChannelChange }: ChannelSelectorProps) {
  return (
    <Select
      value={selectedChannel.id.toString()}
      onValueChange={(value) => {
        const channel = channels.find((c) => c.id.toString() === value)
        if (channel) onChannelChange(channel)
      }}
    >
      <SelectTrigger className="w-auto min-w-[140px] rounded-full bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full overflow-hidden">
            <Image
              src={selectedChannel.image || "/placeholder.svg"}
              alt={selectedChannel.name}
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          <SelectValue className="text-sm font-medium text-white">{selectedChannel.name}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#1E2B31] border-white/10">
        {channels.map((channel) => (
          <SelectItem
            key={channel.id}
            value={channel.id.toString()}
            className="text-white hover:bg-white/5 focus:bg-white/10"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={channel.image || "/placeholder.svg"}
                  alt={channel.name}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
              <span className="text-sm">{channel.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
