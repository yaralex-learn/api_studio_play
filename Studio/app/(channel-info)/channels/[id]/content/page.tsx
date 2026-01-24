"use client";

import ChannelOutlineSidebar from "@/components/channel-outline/channel-outline-sidebar";
import { ContentSelector } from "@/components/content/channel-content-selector";
import { ChannelOutlineProvider } from "@/providers/channel-outline-provider";

export default function ChannelContentPage() {
  return (
    <ChannelOutlineProvider>
      <div className="flex min-h-[calc(100vh-8.5rem)] dark:bg-[#0D1117]">
        <ChannelOutlineSidebar />

        {/* Main content area */}
        <div className="flex-1 p-6 overflow-auto">
          <ContentSelector />
        </div>
      </div>
    </ChannelOutlineProvider>
  );
}
