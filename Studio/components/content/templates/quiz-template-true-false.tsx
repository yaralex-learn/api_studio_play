import GrowableTextarea from "@/components/ui/growable-textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  IChannelQuizContentItem,
  IChannelQuizTrueFalseTemplate,
} from "@/types/channel-content-quiz";

type TTrueFalseQuizTemplateProps = {
  question: IChannelQuizContentItem<IChannelQuizTrueFalseTemplate>;
  onUpdate: (data: Partial<IChannelQuizContentItem>) => void;
};

export default function TrueFalseQuizTemplate({
  question,
  onUpdate,
}: TTrueFalseQuizTemplateProps) {
  const updateTemplate = (data: Partial<IChannelQuizTrueFalseTemplate>) => {
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

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between h-8">
          <Label>Answer Options</Label>
        </div>

        <div className="space-y-2">
          <RadioGroup
            defaultValue={question.template.correct_answer ? "true" : "false"}
          >
            {[true, false]?.map((option, index) => {
              const isCorrect = question.template.correct_answer === option;

              return (
                <div
                  key={`${question.id}-true-false-option-${option}-${index}`}
                  className="flex items-center space-x-2 mt-1"
                >
                  <RadioGroupItem
                    value={option ? "true" : "false"}
                    checked={isCorrect}
                    onClick={() => updateTemplate({ correct_answer: option })}
                    className={cn(!question._editing && "pointer-events-none")}
                  />

                  <Label className={cn("flex-1", isCorrect && "font-medium")}>
                    {option ? "True" : "False"}
                    {isCorrect && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        (Correct)
                      </span>
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </div>
    </>
  );
}
