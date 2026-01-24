import { Button } from "@/components/ui/button";
import GrowableTextarea from "@/components/ui/growable-textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  IChannelQuizContentItem,
  IChannelQuizFillInBlankTemplate,
} from "@/types/channel-content-quiz";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo } from "react";

type TFillInBlankQuizTemplateProps = {
  question: IChannelQuizContentItem<IChannelQuizFillInBlankTemplate>;
  onUpdate: (data: Partial<IChannelQuizContentItem>) => void;
};

export default function FillInBlankQuizTemplate({
  question,
  onUpdate,
}: TFillInBlankQuizTemplateProps) {
  const updateTemplate = (data: Partial<IChannelQuizFillInBlankTemplate>) => {
    onUpdate({ template: { ...question.template, ...data } });
  };

  useEffect(() => {
    const _blankCounts = (question.template.question.trim().match(/___/g) ?? [])
      .length;
    const _blanks = question.template.blanks;
    const _newBlanks: string[] = [];

    for (let index = 0; index < _blankCounts; index++) {
      if (_blanks[index]) {
        _newBlanks[index] = _blanks[index];
      } else {
        _newBlanks[index] = "";
      }
    }

    updateTemplate({ blanks: _newBlanks });
  }, [question.template.question]);

  const options = useMemo(
    () => question.template.options[0] ?? [],
    [question.template.options]
  );

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

        <div className="space-y-3">
          {question.template.blanks.length > 0 ? (
            question.template.blanks.map((blank, index) => (
              <div
                key={`${question.id}-fill-in-the-blank-option-${index}`}
                className="flex items-center gap-4"
              >
                <span className="min-w-8 font-bold text-xl text-muted">
                  {`#${index + 1}`}
                </span>

                <Input
                  className={cn(
                    "flex-1",
                    !question._editing && "pointer-events-none"
                  )}
                  value={blank}
                  placeholder={`Blank field ${index + 1}`}
                  readOnly={question._editing !== true}
                  onChange={(e) =>
                    updateTemplate({
                      blanks: question.template.blanks?.map((b, i) =>
                        index === i ? e.target.value : b
                      ),
                    })
                  }
                />
              </div>
            ))
          ) : (
            <p className="p-3 bg-green-500/15 text-muted-foreground rounded-md">
              <span>{`To add a blank field to the question, simply enter three underscore (_) wherever you want. For example; `}</span>
              <b className="text-green-500">{`This is my first blank field ___ and this is the second one ___.`}</b>
            </p>
          )}
        </div>
      </div>

      {/* Misleading Options */}
      {!question._editing && options.length === 0 ? null : (
        <div className="space-y-3">
          <div
            className={cn(
              "flex items-center justify-between",
              !question._editing && "h-8"
            )}
          >
            <Label>Misleading Options</Label>
            {question._editing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  updateTemplate({
                    options: [[...(question.template.options[0] ?? []), ""]],
                  })
                }
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {options?.map((option, index) => {
              return (
                <div
                  key={`${question.id}-fill-in-the-blank-option-${index}`}
                  className="flex items-center space-x-2 mt-1"
                >
                  {question._editing ? (
                    <>
                      <Input
                        value={option}
                        placeholder={`Option ${index + 1}`}
                        onChange={(e) =>
                          updateTemplate({
                            options: [
                              options?.map((o, i) =>
                                i === index ? e.target.value : o
                              ),
                            ],
                          })
                        }
                      />

                      <Button
                        className="h-8 w-8"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const _tempOptions = [...options];
                          _tempOptions.splice(index, 1);
                          updateTemplate({ options: [_tempOptions] });
                        }}
                      >
                        <Trash2Icon className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <Label className={"flex-1"}>{`${
                      index + 1
                    }) ${option}`}</Label>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
