"use client";

import { RichTextEditor } from "@/components/rich-text-editor";
import useReviseText from "@/hooks/use-revise-text";
import TemplateWrapper from "./lesson-template-wrapper";

interface TextLessonTemplateProps {
  itemId: string;
  isNew?: boolean | null;
  content: string;
  onChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function TextLessonTemplate({
  itemId,
  isNew,
  content,
  onChange,
  onDelete,
  onDuplicate,
}: TextLessonTemplateProps) {
  const { reviseTextMutation } = useReviseText({
    type: "lesson",
    onResponse: onChange,
  });

  return (
    <TemplateWrapper
      itemId={itemId}
      isNew={isNew}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
    >
      <RichTextEditor
        content={content}
        onChange={onChange}
        placeholder="Start writing your content here..."
        className="prose dark:prose-invert max-w-none min-h-[20rem] focus:outline-none focus-visible:outline-none rounded-md"
        aiMutation={reviseTextMutation}
      />
    </TemplateWrapper>
  );
}
