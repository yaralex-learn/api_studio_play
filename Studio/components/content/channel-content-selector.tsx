"use client";

import { useChannelOutline } from "@/providers/channel-outline-provider";
import {
  IChannelActivityOutline,
  IChannelContentOutline,
  IChannelSectionOutline,
  IChannelUnitOutline,
} from "@/types/channel-outline";
import ChannelActivityContent from "./channel-content-activity";
import ChannelLessonContent from "./channel-content-lesson";
import ChannelQuizContent from "./channel-content-quiz";
import ChannelSectionContent from "./channel-content-section";
import ChannelUnitContent from "./channel-content-unit";

export function ContentSelector() {
  const { selectedContent } = useChannelOutline();

  if (!selectedContent) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">No content selected</h2>
          <p className="text-muted-foreground mb-2">
            Select a lesson or quiz from the sidebar to view its content.
          </p>
          <div className="inline-flex items-center justify-center px-4 rounded-md text-sm text-muted-foreground">
            <span className="mr-2">←</span>
            Select content from the sidebar
          </div>
        </div>
      </div>
    );
  }

  const { type, data, indexSequence, ancestors } = selectedContent;

  return (
    <div className="channel-content-container">
      {/* Content */}
      {type === "section" ? (
        <ChannelSectionContent
          key={data.id}
          section={data as IChannelSectionOutline}
          indexSequence={indexSequence}
        />
      ) : type === "unit" ? (
        <ChannelUnitContent
          key={data.id}
          unit={data as IChannelUnitOutline}
          indexSequence={indexSequence}
          ancestors={ancestors}
        />
      ) : type === "activity" ? (
        <ChannelActivityContent
          key={data.id}
          activity={data as IChannelActivityOutline}
          indexSequence={indexSequence}
          ancestors={ancestors}
        />
      ) : type === "lesson" ? (
        <ChannelLessonContent
          key={data.id}
          lesson={data as IChannelContentOutline}
          indexSequence={indexSequence}
          ancestors={ancestors}
        />
      ) : type === "quiz" ? (
        <ChannelQuizContent
          key={data.id}
          quiz={data as IChannelContentOutline}
          indexSequence={indexSequence}
          ancestors={ancestors}
        />
      ) : null}
    </div>
  );
}
