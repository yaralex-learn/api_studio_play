"use client";

import FileSpaceManagerModal from "@/components/file-space-manager/file-space-manager-modal";
import { RichTextEditor } from "@/components/rich-text-editor";
import useReviseText from "@/hooks/use-revise-text";
import { IFileItem } from "@/types/file-space";
import toFileUrl from "@/utils/to-file-url";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { NetworkImage } from "../network-image";
import TemplateWrapper from "./lesson-template-wrapper";

interface ImageTextLessonTemplateProps {
  itemId: string;
  isNew?: boolean | null;
  imageId: string | null;
  textContent: string;
  onImageChange: (src: string) => void;
  onTextChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function ImageTextLessonTemplate({
  itemId,
  isNew,
  imageId,
  textContent,
  onImageChange,
  onTextChange,
  onDelete,
  onDuplicate,
}: ImageTextLessonTemplateProps) {
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const { reviseTextMutation } = useReviseText({
    type: "lesson",
    onResponse: onTextChange,
  });

  const handleFileSelected = (file: IFileItem) => {
    onImageChange(file.id);
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
          {/* Image area */}
          <div
            className="min-h-[18rem] flex rounded-md items-center justify-center bg-black/5 dark:bg-white/5 cursor-pointer"
            onClick={() => setFileManagerOpen(true)}
          >
            {imageId ? (
              <NetworkImage
                className="max-w-full max-h-full object-contain rounded-md"
                src={toFileUrl(imageId)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center opacity-25">
                <ImageIcon className="h-16 w-16 mb-2" />
                <p className="text-sm">Click here to select an image file!</p>
              </div>
            )}
          </div>

          <RichTextEditor
            content={textContent}
            onChange={onTextChange}
            placeholder="Add a description or explanation for this image..."
            aiMutation={reviseTextMutation}
          />
        </div>
      </TemplateWrapper>

      {/* File Space Manager Modal */}
      <FileSpaceManagerModal
        open={fileManagerOpen}
        onOpenChange={setFileManagerOpen}
        onFileSelected={handleFileSelected}
        selectionFileType="image"
      />
    </>
  );
}
