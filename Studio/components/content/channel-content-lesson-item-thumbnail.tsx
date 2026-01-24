import { IChannelLessonContentItem } from "@/types/channel-content-lesson";
import { MouseEventHandler } from "react";
import {
  RiHeadphoneLine,
  RiImageLine,
  RiListRadio,
  RiText,
  RiVideoLine,
} from "react-icons/ri";

type TLessonContentItemThumbnail = {
  data: IChannelLessonContentItem;
  isSelected?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

// Helper function to get the appropriate icon for a card
const getCardIcon = (content: IChannelLessonContentItem) => {
  switch (content.lesson_type) {
    case "text":
      return <RiText className="h-4 w-4" />;
    case "image-text":
      return <RiImageLine className="h-4 w-4" />;
    case "video-text":
      return <RiVideoLine className="h-4 w-4" />;
    case "audio-text":
      return <RiHeadphoneLine className="h-4 w-4" />;
    case "multiple-choice":
      return <RiListRadio className="h-4 w-4" />;
    default:
      return <RiText className="h-4 w-4" />;
  }
};

// Helper function to get the appropriate color class for a card
const getCardColorClass = (content: IChannelLessonContentItem) => {
  // Orange for lesson templates, blue for question templates
  if (content.lesson_type === "multiple-choice") {
    return "text-blue-500";
  } else {
    return "text-orange-500";
  }
};

// Helper function to get the appropriate border color class for a card
const getCardBorderColorClass = (
  content: IChannelLessonContentItem,
  isSelected?: boolean
) => {
  if (isSelected) {
    if (content.lesson_type === "multiple-choice") {
      return "border-blue-500";
    } else {
      return "border-orange-500";
    }
  }
  return "border-border";
};

export function LessonContentItemThumbnail({
  data,
  isSelected,
  onClick,
}: TLessonContentItemThumbnail) {
  return (
    <div
      className={`w-12 h-8 rounded-md flex items-center justify-center border ${getCardBorderColorClass(
        data,
        isSelected
      )}`}
      onClick={onClick}
    >
      <div className={getCardColorClass(data)}>{getCardIcon(data)}</div>
    </div>
  );
}
