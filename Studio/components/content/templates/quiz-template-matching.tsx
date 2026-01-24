import { Button } from "@/components/ui/button";
import GrowableTextarea from "@/components/ui/growable-textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  IChannelQuizContentItem,
  IChannelQuizMatchingTemplate,
} from "@/types/channel-content-quiz";
import { ArrowLeftRightIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useMemo } from "react";

type TMatchingQuizTemplateProps = {
  question: IChannelQuizContentItem<IChannelQuizMatchingTemplate>;
  onUpdate: (data: Partial<IChannelQuizContentItem>) => void;
};

export default function MatchingQuizTemplate({
  question,
  onUpdate,
}: TMatchingQuizTemplateProps) {
  const updateTemplate = (data: Partial<IChannelQuizMatchingTemplate>) => {
    onUpdate({ template: { ...question.template, ...data } });
  };

  const optionPairEntries = useMemo(() => {
    const _options = question.template.options;
    const _pairs = question.template.pairs;
    return _options.map((item, index) => [item, _pairs[index] ?? ""]);
  }, [question.template.options, question.template.pairs]);

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
                  options: [...question.template.options, ""],
                  pairs: [...question.template.pairs, ""],
                })
              }
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {optionPairEntries.map(([option, pair], index) => (
            <div
              key={`${question.id}-matching-option-${index}`}
              className="flex items-center gap-4"
            >
              <Input
                className={cn(
                  "flex-1",
                  !question._editing && "pointer-events-none"
                )}
                value={option}
                placeholder="Item"
                readOnly={question._editing !== true}
                onChange={(e) =>
                  updateTemplate({
                    options: question.template.options?.map((o, i) =>
                      index === i ? e.target.value : o
                    ),
                  })
                }
              />

              <ArrowLeftRightIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />

              <Input
                className={cn(
                  "flex-1",
                  !question._editing && "pointer-events-none"
                )}
                value={pair}
                placeholder="Match"
                readOnly={question._editing !== true}
                onChange={(e) =>
                  updateTemplate({
                    pairs: question.template.pairs.map((p, i) =>
                      index === i ? e.target.value : p
                    ),
                  })
                }
              />

              {question._editing && (
                <Button
                  className="h-8 w-8"
                  variant="ghost"
                  size="icon"
                  disabled={(question.template.options?.length ?? 0) <= 2}
                  onClick={() => {
                    const _tempOptions = [...question.template.options];
                    const _tempPairs = [...question.template.pairs];

                    _tempOptions.splice(index, 1);
                    _tempPairs.splice(index, 1);

                    updateTemplate({
                      options: _tempOptions,
                      pairs: _tempPairs,
                    });
                  }}
                >
                  <Trash2Icon className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
