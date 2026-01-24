"use client";

import FileSpaceManagerModal from "@/components/file-space-manager/file-space-manager-modal";
import { RichTextEditor } from "@/components/rich-text-editor";
import useReviseText from "@/hooks/use-revise-text";
import { IFileItem } from "@/types/file-space";
import toFileUrl from "@/utils/to-file-url";
import { Headphones } from "lucide-react";
import { useState } from "react";
import TemplateWrapper from "./lesson-template-wrapper";

interface AudioTextLessonTemplateProps {
  itemId: string;
  isNew?: boolean | null;
  audioId: string | null;
  textContent: string;
  onAudioChange: (src: string) => void;
  onTextChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function AudioTextLessonTemplate({
  itemId,
  isNew,
  audioId,
  textContent,
  onAudioChange,
  onTextChange,
  onDelete,
  onDuplicate,
}: AudioTextLessonTemplateProps) {
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const { reviseTextMutation } = useReviseText({
    type: "lesson",
    onResponse: onTextChange,
  });

  const handleFileSelected = (file: IFileItem) => {
    onAudioChange(file.id);
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
          {/* Audio area */}
          <div
            className="min-h-[18.5rem] flex rounded-md items-center justify-center bg-black/5 dark:bg-white/5 cursor-pointer"
            onClick={() => setFileManagerOpen(true)}
          >
            {audioId ? (
              <div className="w-full">
                <audio src={toFileUrl(audioId)} controls className="w-full" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center opacity-25 py-8">
                <Headphones className="h-16 w-16 mb-2" />
                <p className="text-sm">Click here to select an audio file!</p>
              </div>
            )}
          </div>

          <RichTextEditor
            content={textContent}
            onChange={onTextChange}
            placeholder="Add a description or explanation for this audio..."
            aiMutation={reviseTextMutation}
          />
        </div>
      </TemplateWrapper>

      {/* File Space Manager Modal */}
      <FileSpaceManagerModal
        open={fileManagerOpen}
        onOpenChange={setFileManagerOpen}
        onFileSelected={handleFileSelected}
        selectionFileType="audio"
      />
    </>
  );
}
