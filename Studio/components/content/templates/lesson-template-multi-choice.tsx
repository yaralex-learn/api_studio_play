"use client";
import { Button } from "@/components/ui/button";
import GrowableTextarea from "@/components/ui/growable-textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import { ChannelLessonMultiChoiceTemplate } from "@/lib/channel-content";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  IChannelAiGeneratedLessonQuestion,
  ILessonContentQuestion,
} from "@/types/channel-content-lesson";
import { ChannelQuizTemplateID } from "@/types/channel-content-quiz";
import { useMutation } from "@tanstack/react-query";
import { Minus, Plus, Trash2Icon } from "lucide-react";
import { ChangeEvent } from "react";
import TemplateWrapper from "./lesson-template-wrapper";

interface MultipleChoiceLessonTemplateProps {
  itemId: string;
  isNew?: boolean | null;
  data?: ILessonContentQuestion;
  onChange: (data: ILessonContentQuestion) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function MultipleChoiceLessonTemplate({
  itemId,
  isNew,
  data = ChannelLessonMultiChoiceTemplate,
  onChange,
  onDelete,
  onDuplicate,
}: MultipleChoiceLessonTemplateProps) {
  const { refreshToken } = useAuth();

  const fillQuestionWithAiMutation = useMutation({
    mutationKey: ["fillQuestionWithAiMutation", { id: itemId }],
    mutationFn: async (prompt: string) => {
      await refreshToken();

      const res = await Api.post<IChannelAiGeneratedLessonQuestion>(
        "/studio/channel/generate-questions/",
        {
          initial_prompt: prompt,
          template_id: ChannelQuizTemplateID.LESSON_MULTIPLE_CHOICE,
          difficulty: "intermediate",
          num_questions: 1,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      const _generateQuestion = data.questions[0];
      if (_generateQuestion) {
        onChange(_generateQuestion);

        Toast.s({
          title: "Question generated!",
          description:
            "The generated question data has filled in the selected question!",
        });
      }
    },
  });

  // Add handlers for points and timeLimit
  const handlePointsChange = (points: number) => {
    onChange({
      ...data,
      points,
    });
  };

  const handleTimeLimitChange = (timeLimit: number | null) => {
    onChange({
      ...data,
      time_limit: timeLimit,
    });
  };
  // Handle question text change
  const handleQuestionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...data,
      question: e.target.value,
    });
  };

  // Handle option text change
  const handleOptionTextChange = (index: number, text: string) => {
    const updatedOptions = data.options.map((option, oIndex) => {
      if (index === oIndex) {
        return { ...option, text };
      }
      return option;
    });

    onChange({
      ...data,
      options: updatedOptions,
    });
  };

  // Handle correct answer selection
  const handleCorrectAnswerChange = (index: number) => {
    const updatedOptions = data.options.map((option, oIndex) => ({
      ...option,
      isCorrect: index === oIndex,
    }));

    onChange({
      ...data,
      options: updatedOptions,
    });
  };

  // Add new option
  const handleAddOption = () => {
    onChange({
      ...data,
      options: [...data.options, { text: "", isCorrect: false }],
    });
  };

  // Remove option
  const handleRemoveOption = (index: number) => {
    // Don't allow removing if there are only 2 options left
    if (data.options.length <= 2) {
      return;
    }

    onChange({
      ...data,
      options: data.options.filter((_, oIndex) => index !== oIndex),
    });
  };

  // Handle option explanation change
  const handleOptionExplanationChange = (
    index: number,
    explanation: string
  ) => {
    const updatedOptions = data.options.map((option, oIndex) => {
      if (index === oIndex) {
        return { ...option, explanation };
      }
      return option;
    });

    onChange({
      ...data,
      options: updatedOptions,
    });
  };

  return (
    <TemplateWrapper
      itemId={itemId}
      isNew={isNew}
      aiMutation={fillQuestionWithAiMutation}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
    >
      <div className="space-y-4">
        {/* Question text */}
        <GrowableTextarea
          value={data.question}
          onChange={handleQuestionChange}
          placeholder="Enter your question here"
          className={cn(
            "min-h-fit resize-none text-lg font-medium px-1 rounded-none",
            "ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            "outline-none focus-visible:outline-none",
            "border-t-0 border-x-0 border-b-transparent hover:border-muted-foreground focus-visible:border-b-primary"
          )}
        />

        {/* Options */}
        <RadioGroup
          value={data.options.findIndex((o) => o.isCorrect).toString()}
          onValueChange={(value) =>
            handleCorrectAnswerChange(Number.parseInt(value))
          }
          className="mt-4 space-y-4"
        >
          {data.options.map((option, index) => {
            const _key = `${itemId}-lesson-multiple-choice-${index}`;
            return (
              <div key={_key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={`${index}`} id={_key} />
                  <div className="flex-1 flex items-center">
                    <Input
                      value={option.text}
                      placeholder={`Write option ${index + 1} here`}
                      className={cn(
                        "inline-block w-full rounded-none px-1",
                        "ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                        "outline-none focus-visible:outline-none",
                        "border-t-0 border-x-0 border-b-transparent hover:border-muted-foreground focus-visible:border-b-primary"
                      )}
                      onChange={(e) =>
                        handleOptionTextChange(index, e.target.value)
                      }
                    />

                    {option.isCorrect && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                        Correct
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveOption(index)}
                    disabled={data.options.length <= 2}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Option-specific explanation */}
                <div className="pl-4 ml-[.45rem] border-l-2 border-muted">
                  <div className="text-xs text-muted-foreground my-1">
                    Explanation for this option (optional):
                  </div>
                  <Input
                    value={option.explanation ?? ""}
                    placeholder="Write explanation for this option"
                    className={cn(
                      "inline-block w-full rounded bg-muted/30",
                      "ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                      "outline-none focus-visible:outline-none",
                      "border-none focus-visible:border-none"
                    )}
                    onChange={(e) =>
                      handleOptionExplanationChange(index, e.target.value)
                    }
                  />
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {/* Add option button */}
        <Button
          variant="link"
          size="sm"
          onClick={handleAddOption}
          className="!p-0 mt-1"
        >
          <Plus className="h-4 w-4" />
          Add Option
        </Button>

        {/* Footer with points and time limit */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 rounded-md px-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-7 h-7"
                onClick={() =>
                  handlePointsChange(Math.max(1, (data.points || 5) - 1))
                }
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="px-1 text-xs font-medium">
                {data.points || 5}{" "}
                {(data.points || 5) === 1 ? "point" : "points"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="w-7 h-7"
                onClick={() => handlePointsChange((data.points || 5) + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Select
              value={data.time_limit ? `${data.time_limit}` : "no-limit"}
              onValueChange={(value) =>
                handleTimeLimitChange(
                  value === "no-limit" ? null : parseInt(value)
                )
              }
            >
              <SelectTrigger className="h-7 text-xs border-none bg-muted/50 w-32">
                <SelectValue placeholder="Time limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-limit">No time limit</SelectItem>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="15">15 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </TemplateWrapper>
  );
}
