import { IChannelLessonContentItem } from "@/types/channel-content-lesson";
import AudioTextLessonTemplate from "./templates/lesson-template-audio-text";
import ImageTextLessonTemplate from "./templates/lesson-template-image-text";
import MultipleChoiceLessonTemplate from "./templates/lesson-template-multi-choice";
import TextLessonTemplate from "./templates/lesson-template-text";
import VideoTextLessonTemplate from "./templates/lesson-template-video-text";

type TLessonContentItem = {
  data: IChannelLessonContentItem;
  onChange: (data: Record<string, any>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
};

export function LessonContentItem({
  data,
  onChange,
  onDelete,
  onDuplicate,
}: TLessonContentItem) {
  switch (data.lesson_type) {
    case "text":
      return (
        <TextLessonTemplate
          itemId={data.id}
          isNew={data._new}
          content={data.text ?? ""}
          onChange={(text) => onChange({ text })}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      );

    case "image-text":
      return (
        <ImageTextLessonTemplate
          itemId={data.id}
          isNew={data._new}
          imageId={data.file_ids?.[0] ?? ""}
          textContent={data.text ?? ""}
          onImageChange={(fileId) => onChange({ file_ids: [fileId] })}
          onTextChange={(text) => onChange({ text })}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      );

    case "video-text":
      return (
        <VideoTextLessonTemplate
          itemId={data.id}
          isNew={data._new}
          videoId={data.file_ids?.[0] ?? ""}
          textContent={data.text ?? ""}
          onVideoChange={(fileId) => onChange({ file_ids: [fileId] })}
          onTextChange={(text) => onChange({ text })}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      );

    case "audio-text":
      return (
        <AudioTextLessonTemplate
          itemId={data.id}
          isNew={data._new}
          audioId={data.file_ids?.[0] ?? ""}
          textContent={data.text ?? ""}
          onAudioChange={(fileId) => onChange({ file_ids: [fileId] })}
          onTextChange={(text) => onChange({ text })}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      );

    case "multiple-choice":
      return (
        <MultipleChoiceLessonTemplate
          itemId={data.id}
          isNew={data._new}
          data={data.question_lesson ?? undefined}
          onChange={(question_lesson) => onChange({ question_lesson })}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      );

    default:
      return <div>Unknown card type</div>;
  }
}
