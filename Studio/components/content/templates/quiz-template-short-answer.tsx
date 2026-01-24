import GrowableTextarea from "@/components/ui/growable-textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  IChannelQuizContentItem,
  IChannelQuizShortAnswerTemplate,
} from "@/types/channel-content-quiz";

type TShortAnswerQuizTemplateProps = {
  question: IChannelQuizContentItem<IChannelQuizShortAnswerTemplate>;
  onUpdate: (data: Partial<IChannelQuizContentItem>) => void;
};

export default function ShortAnswerQuizTemplate({
  question,
  onUpdate,
}: TShortAnswerQuizTemplateProps) {
  const updateTemplate = (data: Partial<IChannelQuizShortAnswerTemplate>) => {
    onUpdate({ template: { ...question.template, ...data } });
  };

  return (
    <>
      <div>
        <GrowableTextarea
          value={question.template.question}
          onChange={(e) => updateTemplate({ question: e.target.value })}
          readOnly={question._editing !== true}
          placeholder={
            question._editing ? "Enter your question here" : "No question text"
          }
          className={cn(
            "min-h-fit resize-none text-lg font-medium px-1 rounded-none",
            "ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            "outline-none focus-visible:outline-none",
            question._editing
              ? "border-t-0 border-x-0 border-b-transparent hover:border-muted-foreground focus-visible:border-b-primary"
              : "border-none focus-visible:border-none"
          )}
        />
      </div>

      {/* Short Answer */}
      <div className="space-y-3">
        <Label className="w-full h-8">Short Answer</Label>

        <GrowableTextarea
          value={question.template.correct_answer ?? ""}
          onChange={(e) => updateTemplate({ correct_answer: e.target.value })}
          readOnly={question._editing !== true}
          placeholder={
            question._editing
              ? "Enter your short answer here"
              : "No answer text"
          }
        />
      </div>
    </>
  );
}
