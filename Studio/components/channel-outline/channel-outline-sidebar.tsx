import { useChannelOutline } from "@/providers/channel-outline-provider";
import { useChannel } from "@/providers/channel-provider";
import searchChannelOutline from "@/utils/search-channel-ouline";
import {
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  CircleSlash2,
  PlusIcon,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AIPromptButton } from "../ai-prompt-button";
import { ResizableSidebar } from "../resizable-sidebar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  ChannelNewSectionOutlineItem,
  ChannelSectionOutlineItem,
} from "./channel-outline-item-section";

export default function ChannelOutlineSidebar() {
  const { channel } = useChannel();
  const { isOpen, expandAll, collapseAll } = useChannelOutline();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewSection, setShowNewSection] = useState(false);

  const searchResults = useMemo(() => {
    const _query = searchQuery.trim();
    const _sections = channel.outline_content.sections;

    if (!_query) return channel.outline_content.sections;
    return searchChannelOutline(_sections, _query);
  }, [searchQuery, channel.outline_content.sections]);

  return isOpen ? (
    <ResizableSidebar
      defaultWidth={320}
      minWidth={240}
      maxWidth={500}
      className="bg-background border-r border-border"
      headerContent={
        <div className="flex flex-col border-b py-3 gap-3">
          <div className="flex justify-between items-center px-4 ">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipContent side="bottom" align="start">
                  Collapse All
                </TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => collapseAll()}
                  >
                    <ChevronsDownUpIcon className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>

              <Tooltip>
                <TooltipContent side="bottom" align="start">
                  Expand All
                </TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => expandAll(channel.outline_content.sections)}
                  >
                    <ChevronsUpDownIcon className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </div>
            <div className="flex items-center gap-1">
              <AIPromptButton variant="ghost" size="icon" className="h-6 w-6" />

              <Tooltip>
                <TooltipContent side="bottom">New Section</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowNewSection(true)}
                    title="Add Section"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </div>
          </div>

          {/* Search input */}
          <div className="px-4 relative">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="pl-8 pr-8 h-8 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-transparent"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="relative flex flex-col h-full px-2 pt-2 pb-4">
        {showNewSection || searchResults.length > 0 ? (
          <>
            {searchResults.map((section, index) => (
              <ChannelSectionOutlineItem
                key={section.id}
                index={index + 1}
                channelId={channel.channel_id}
                section={section}
                searchQuery={searchQuery}
              />
            ))}

            {showNewSection && (
              <ChannelNewSectionOutlineItem
                channelId={channel.channel_id}
                lastOrder={channel.outline_content.sections.length}
                onCancel={() => setShowNewSection(false)}
                onCreate={() => setShowNewSection(false)}
              />
            )}
          </>
        ) : searchQuery.length > 0 ? (
          // No search results
          <div className="flex flex-col gap-1 items-center justify-center pt-12 text-muted-foreground">
            <Search className="h-12 w-12 mb-2 opacity-50" />
            <p>No items match your search</p>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => setSearchQuery("")}
            >
              <X />
              Clear Search
            </Button>
          </div>
        ) : (
          // Empty outline
          <div className="flex flex-col gap-1 items-center justify-center pt-12 text-muted-foreground">
            <CircleSlash2 className="h-12 w-12 mb-2 opacity-50" />
            <p>No item in channel outline!</p>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => setShowNewSection(true)}
            >
              <PlusIcon />
              New Section
            </Button>
          </div>
        )}
      </div>
    </ResizableSidebar>
  ) : null;
}
