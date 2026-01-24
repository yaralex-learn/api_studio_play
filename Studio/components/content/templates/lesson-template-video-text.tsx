"use client";

import FileSpaceManagerModal from "@/components/file-space-manager/file-space-manager-modal";
import { RichTextEditor } from "@/components/rich-text-editor";
import useReviseText from "@/hooks/use-revise-text";
import { IFileItem } from "@/types/file-space";
import toFileUrl from "@/utils/to-file-url";
import { Video } from "lucide-react";
import { useState } from "react";
import TemplateWrapper from "./lesson-template-wrapper";

interface VideoTextLessonTemplateProps {
  itemId: string;
  isNew?: boolean | null;
  videoId: string;
  textContent: string;
  onVideoChange: (src: string) => void;
  onTextChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function VideoTextLessonTemplate({
  itemId,
  isNew,
  videoId,
  textContent,
  onVideoChange,
  onTextChange,
  onDelete,
  onDuplicate,
}: VideoTextLessonTemplateProps) {
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const { reviseTextMutation } = useReviseText({
    type: "lesson",
    onResponse: onTextChange,
  });

  const handleFileSelected = (file: IFileItem) => {
    onVideoChange(file.id);
    setFileManagerOpen(false);
  };

  return (
    <>
      <TemplateWrapper
        itemId={itemId}
        isNew={isNew}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      >
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Video area */}
          <div
            className="min-h-[18rem] flex rounded-md items-center justify-center bg-black/5 dark:bg-white/5 cursor-pointer"
            onClick={() => setFileManagerOpen(true)}
          >
            {videoId ? (
              <video
                src={toFileUrl(videoId)}
                controls
                className="w-full h-auto rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Video className="h-16 w-16 mb-2 opacity-50" />
                <p>Click here to select a video file!</p>
              </div>
            )}
          </div>

          <RichTextEditor
            content={textContent}
            onChange={onTextChange}
            placeholder="Add a description or explanation for this video..."
            aiMutation={reviseTextMutation}
          />
        </div>
      </TemplateWrapper>

      {/* File Space Manager Modal */}
      <FileSpaceManagerModal
        open={fileManagerOpen}
        onOpenChange={setFileManagerOpen}
        onFileSelected={handleFileSelected}
        selectionFileType="video"
      />
    </>
  );
}
