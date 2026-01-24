"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChannel } from "@/providers/channel-provider";
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

type ViewMode = "mobile" | "tablet" | "desktop";

export default function ChannelPreviewPage() {
  const { CHANNEL_URL } = useChannel();
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  // Get preview container width based on view mode
  const getPreviewWidth = () => {
    switch (viewMode) {
      case "mobile":
        return "w-[375px]";
      case "tablet":
        return "w-[768px]";
      case "desktop":
        return "w-full";
    }
  };

  return (
    <div className="container py-6 px-4 flex flex-col gap-6">
      {/* Preview section */}
      <div className="flex flex-col items-center space-y-4 w-full">
        <div className="w-full flex items-center justify-between">
          <h3 className="text-lg font-semibold">Channel Preview</h3>

          <div className="flex items-center gap-2">
            {/* View mode buttons */}
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setViewMode("mobile")}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "tablet" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setViewMode("tablet")}
                title="Tablet View"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setViewMode("desktop")}
                title="Desktop View"
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open in new tab
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "transition-all duration-300 flex justify-center",
            getPreviewWidth()
          )}
        >
          <div className="w-full border rounded-md overflow-hidden bg-background h-[48rem] dark:bg-[#0D1117]">
            <div className="w-full border-b p-3 bg-muted/30 flex items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-1.5" />
              <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1.5" />
              <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5" />
              <div className="flex-1" />
            </div>
            <div className="w-full h-[calc(100%-40px)]">
              <iframe
                src={CHANNEL_URL ?? undefined}
                className="w-full h-full"
                title="Channel Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
