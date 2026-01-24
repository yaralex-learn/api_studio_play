"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChannelLessonMultiChoiceTemplate } from "@/lib/channel-content";
import {
  IChannelLessonContentItem,
  TChannelLessonContentType,
} from "@/types/channel-content-lesson";
import type React from "react";
import {
  RiHeadphoneLine,
  RiImageLine,
  RiListRadio,
  RiText,
  RiVideoLine,
} from "react-icons/ri";

interface ITemplateOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  type: TChannelLessonContentType;
}

interface SelectTemplateModalProps {
  open: boolean;
  lessonId: string;
  lastOrder: number;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (newItem: IChannelLessonContentItem) => void;
}

const lessonTemplates: ITemplateOption[] = [
  {
    id: "text",
    title: "Text",
    icon: <RiText className="h-8 w-8" />,
    description: "Simple text content with formatting options",
    type: "text",
  },
  {
    id: "image-text",
    title: "Image + Text",
    icon: <RiImageLine className="h-8 w-8" />,
    description: "Image with accompanying text explanation",
    type: "image-text",
  },
  {
    id: "video-text",
    title: "Video + Text",
    icon: <RiVideoLine className="h-8 w-8" />,
    description: "Video with accompanying text explanation",
    type: "video-text",
  },
  {
    id: "audio-text",
    title: "Audio + Text",
    icon: <RiHeadphoneLine className="h-8 w-8" />,
    description: "Audio with accompanying text explanation",
    type: "audio-text",
  },
  {
    id: "multiple-choice",
    title: "Multiple Choice",
    icon: <RiListRadio className="h-8 w-8" />,
    description: "Question with multiple options and one correct answer",
    type: "multiple-choice",
  },
] as const;

export function SelectTemplateModal({
  open,
  lessonId,
  lastOrder,
  onOpenChange,
  onSelectTemplate,
}: SelectTemplateModalProps) {
  function handleSelectTemplate(templateType: TChannelLessonContentType) {
    const _newItemId = `new-lesson-content-${templateType}-item-${lastOrder}-${Date.now()}`;
    let _newItem: IChannelLessonContentItem | undefined;

    switch (templateType) {
      case "text":
        _newItem = {
          _new: true,
          id: _newItemId,
          lesson_outline_id: lessonId,
          lesson_type: "text",
          order: lastOrder,
          text: "",
        };
        break;

      case "image-text":
      case "video-text":
      case "audio-text":
        _newItem = {
          _new: true,
          id: _newItemId,
          lesson_outline_id: lessonId,
          lesson_type: templateType,
          order: lastOrder,
          text: "",
          file_ids: [],
        };
        break;

      case "multiple-choice":
        _newItem = {
          _new: true,
          id: _newItemId,
          lesson_outline_id: lessonId,
          lesson_type: templateType,
          order: lastOrder,
          question_lesson: ChannelLessonMultiChoiceTemplate,
        };
        break;
    }

    onSelectTemplate(_newItem);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Lesson Templates</DialogTitle>
          <DialogDescription>Select one of lesson templates!</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {lessonTemplates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-6 hover:bg-accent"
              onClick={() => {
                handleSelectTemplate(template.type);
                onOpenChange(false);
              }}
            >
              <div className="text-primary mb-2">{template.icon}</div>
              <h3 className="font-medium mb-1">{template.title}</h3>
              <p className="text-xs text-muted-foreground text-center">
                {template.description}
              </p>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
