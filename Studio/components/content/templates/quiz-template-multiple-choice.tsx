import { Button } from "@/components/ui/button";
import GrowableTextarea from "@/components/ui/growable-textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  IChannelQuizContentItem,
  IChannelQuizMultipleChoiceTemplate,
} from "@/types/channel-content-quiz";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useMemo } from "react";

type TMultiChoiceQuizTemplateProps = {
  question: IChannelQuizContentItem<IChannelQuizMultipleChoiceTemplate>;
  onUpdate: (
    data: Partial<IChannelQuizContentItem<IChannelQuizMultipleChoiceTemplate>>
  ) => void;
};

export default function MultiChoiceQuizTemplate({
  question,
  onUpdate,
}: TMultiChoiceQuizTemplateProps) {
  const updateTemplate = (
    data: Partial<IChannelQuizMultipleChoiceTemplate>
  ) => {
    onUpdate({ template: { ...question.template, ...data } });
  };

  const duplicatedIndexes = useMemo(() => {
    const _options = question.template.options;
    return _options
      .map((item, i) => (_options.indexOf(item) !== i ? i : -1))
      .filter((i) => i !== -1);
  }, [question.template.options]);

  const correctIndex = useMemo(() => {
    let index = 0;
    for (const option of question.template.options) {
      if (option === question.template.correct_answer) {
        return index;
      }
      ++index;
    }
  }, [question.template.correct_answer, question.template.options]);

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
        <div
          className={cn(
            "flex items-center justify-between",
            !question._editing && "h-8"
          )}
        >
          <Label>Answer Options</Label>
          {question._editing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                updateTemplate({
                  options: [...(question.template.options ?? []), ""],
                })
              }
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <RadioGroup
            defaultValue={question.template.options?.find(
              (o) => o === question.template.correct_answer
            )}
          >
            {question.template.options?.map((option, index) => {
              const isCorrect = correctIndex === index;
              const isDuplicated = duplicatedIndexes.includes(index);

              return (
                <div
                  key={`${question.id}-multiple-choice-option-${index}`}
                  className="flex items-center space-x-2 mt-1"
                >
                  <RadioGroupItem
                    value={option}
                    checked={isCorrect}
                    onClick={() => updateTemplate({ correct_answer: option })}
                    className={cn(!question._editing && "pointer-events-none")}
                  />

                  {question._editing ? (
                    <>
                      <div className="flex-1 relative">
                        <Input
                          className={cn(
                            isDuplicated && "pr-[5.5rem] border-red-500"
                          )}
                          value={option}
                          placeholder={`Option ${index + 1}`}
                          onChange={(e) => {
                            const _value = e.target.value;
                            const _updateObj: Record<string, any> = {
                              options: question.template.options?.map((o, i) =>
                                i === index ? _value : o
                              ),
                            };

                            if (isCorrect) {
                              _updateObj.correct_answer = _value;
                            }

                            updateTemplate(_updateObj);
                          }}
                        />

                        {isDuplicated && (
                          <span className="absolute top-3 right-3 text-xs text-red-600 dark:text-red-400 bg-background">
                            (Duplicated)
                          </span>
                        )}
                      </div>

                      <Button
                        className="h-8 w-8"
                        size="icon"
                        variant="ghost"
                        disabled={(question.template.options?.length ?? 0) <= 2}
                        onClick={() => {
                          const _tempOptions = [...question.template.options];
                          _tempOptions.splice(index, 1);
                          updateTemplate({ options: _tempOptions });
                        }}
                      >
                        <Trash2Icon className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <Label className={cn("flex-1", isCorrect && "font-medium")}>
                      {option.trim().length > 0
                        ? option
                        : `Option ${index + 1}`}

                      {isDuplicated ? (
                        <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                          (Duplicated)
                        </span>
                      ) : isCorrect ? (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                          (Correct)
                        </span>
                      ) : null}
                    </Label>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </div>
    </>
  );
}
