import { AIPromptButton } from "@/components/ai-prompt-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { useChannel } from "@/providers/channel-provider";
import {
  IChannelAiGeneratedQuiz,
  IChannelQuizContentItem,
  IChannelQuizFillInBlankTemplate,
  IChannelQuizMatchingTemplate,
  IChannelQuizMultipleChoiceTemplate,
  IChannelQuizShortAnswerTemplate,
  IChannelQuizTrueFalseTemplate,
} from "@/types/channel-content-quiz";
import { reorderArray } from "@/utils/arrays";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "@tanstack/react-query";
import {
  CheckIcon,
  CopyIcon,
  GripVerticalIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import DeleteContentTemplateDialog from "../delete-template-modal";
import FillInBlankQuizTemplate from "./quiz-template-fill-in-blank";
import MatchingQuizTemplate from "./quiz-template-matching";
import MultiChoiceQuizTemplate from "./quiz-template-multiple-choice";
import ShortAnswerQuizTemplate from "./quiz-template-short-answer";
import TrueFalseQuizTemplate from "./quiz-template-true-false";

type TQuizTemplateWrapperProps = {
  index: number;
  question: IChannelQuizContentItem;
  setFormData: Dispatch<SetStateAction<IChannelQuizContentItem[]>>;
};

export default function QuizTemplateWrapper({
  question,
  index,
  setFormData,
}: PropsWithChildren<TQuizTemplateWrapperProps>) {
  const { refreshToken } = useAuth();
  const { channel } = useChannel();
  const [tmpQuestion, setTmpQuestion] = useState(question);
  const questionType = question.template.type;

  useEffect(() => setTmpQuestion(question), [question]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? "relative" : "static",
    boxShadow: isDragging ? "0 5px 15px rgba(0,0,0,0.1)" : "none",
  } as React.CSSProperties;

  const questionTypeTitle = useMemo(() => {
    switch (question.template.type) {
      case "multiple_choice":
        return "Multiple Choice";
      case "true_false":
        return "True/False";
      case "fill_in_the_blank":
        return "Fill in the Blank";
      case "matching":
        return "Matching";
      case "short_answer":
        return "Short Answer";
    }
  }, [question.template.type]);

  const toggleEditMode = (force?: boolean) => {
    setTmpQuestion((pv) => ({
      ...pv,
      _editing: force != null ? force : !pv._editing,
    }));
  };

  const updateQuestion = (data: Partial<IChannelQuizContentItem>) => {
    setTmpQuestion((pv) => ({ ...pv, ...data }));
  };

  const duplicateQuestion = () => {
    const _newItemId = `new-duplicate-quiz-content-${questionType}-item-${
      index + 1
    }-${Date.now()}`;

    setFormData((pv) => {
      const _tempFormData = [...pv];
      _tempFormData.splice(index + 1, 0, {
        ...question,
        id: _newItemId,
        _new: true,
      });
      return reorderArray(_tempFormData);
    });
    5;

    Toast.s({
      title: "Item duplicated!",
      description: "Your changes saved successfully!",
    });
  };

  const deleteQuestion = () => {
    setFormData((pb) => reorderArray(pb.filter((q) => q.id !== question.id)));
  };

  const fillQuestionWithAiMutation = useMutation({
    mutationKey: ["fillQuestionWithAiMutation", { id: question.id }],
    mutationFn: async (prompt: string) => {
      await refreshToken();

      const res = await Api.post<IChannelAiGeneratedQuiz>(
        "/studio/channel/generate-questions/",
        {
          initial_prompt: prompt,
          template_id: question.template.id,
          difficulty: "intermediate",
          num_questions: 1,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      const _generateQuestion = data.questions[0];
      if (_generateQuestion) {
        updateQuestion({
          _editing: true,
          template: _generateQuestion,
        });

        Toast.s({
          title: "Question generated!",
          description:
            "The generated question data has filled in the selected question!",
        });
      }
    },
  });

  const deleteQuestionTemplateMutation = useMutation({
    mutationKey: ["deleteQuestionTemplateMutation", { id: question.id }],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.delete(
        `/studio/channel/content/${channel.channel_id}/questions/${question.id}/`
      );
      return res.data;
    },
    onSuccess: () => {
      deleteQuestion();
      Toast.s({
        title: "Item removed!",
        description: "Your changes saved successfully!",
      });
    },
  });

  return (
    <Card
      key={question.id}
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => toggleEditMode(true)}
    >
      <CardHeader className="flex !flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center">
          <span>Question {index + 1}</span>
          <span className="ml-2 text-xs px-2 py-1 bg-muted rounded-full">
            {questionTypeTitle}
          </span>

          {tmpQuestion._editing ? (
            <div className="flex items-center ml-2">
              <span className="text-xs bg-muted rounded-full flex items-center">
                <button
                  className="px-1 py-1.5 hover:bg-muted-foreground/10 rounded-l-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuestion({
                      points: Math.max(0, (tmpQuestion.points ?? 0) - 1),
                    });
                  }}
                >
                  <MinusIcon className="h-3 w-3" />
                </button>

                <span className="px-1 whitespace-nowrap">
                  {tmpQuestion.points ?? 0} point
                  {tmpQuestion.points === 1 ? "" : "s"}
                </span>

                <button
                  className="px-1 py-1.5 hover:bg-muted-foreground/10 rounded-r-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuestion({ points: (tmpQuestion.points ?? 0) + 1 });
                  }}
                >
                  <PlusIcon className="h-3 w-3" />
                </button>
              </span>

              <Select
                value={
                  tmpQuestion.time_limit != null
                    ? `${tmpQuestion.time_limit}`
                    : "no-limit"
                }
                onValueChange={(value) =>
                  updateQuestion({
                    time_limit: value === "no-limit" ? null : parseInt(value),
                  })
                }
              >
                <SelectTrigger className="h-7 ml-2 text-xs bg-muted rounded-full border-none">
                  <SelectValue placeholder="Time limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-limit">No time limit</SelectItem>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="20">20 seconds</SelectItem>
                  <SelectItem value="25">25 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="35">35 seconds</SelectItem>
                  <SelectItem value="40">40 seconds</SelectItem>
                  <SelectItem value="45">45 seconds</SelectItem>
                  <SelectItem value="50">50 seconds</SelectItem>
                  <SelectItem value="55">55 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="180">3 minutes</SelectItem>
                  <SelectItem value="240">4 minutes</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <span className="ml-2 text-xs px-2 py-1 bg-muted rounded-full">
                {tmpQuestion.points
                  ? `${tmpQuestion.points} point${tmpQuestion.points && "s"}`
                  : "No points"}
              </span>

              <span className="ml-2 text-xs px-2 py-1 bg-muted rounded-full">
                {tmpQuestion.time_limit
                  ? tmpQuestion.time_limit >= 60
                    ? `${Math.floor(tmpQuestion.time_limit / 60)} minutes`
                    : `${tmpQuestion.time_limit} seconds`
                  : "No time limit"}
              </span>
            </>
          )}
        </CardTitle>

        <div className="flex items-center gap-2">
          {tmpQuestion._editing ? (
            <>
              <Tooltip>
                <TooltipContent>Discard</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toggleEditMode();
                      setTmpQuestion(question);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Undo2Icon className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>

              <Tooltip>
                <TooltipContent>Save</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData((pv) =>
                        pv.map((q) =>
                          q.id === question.id
                            ? { ...tmpQuestion, _editing: false }
                            : q
                        )
                      );
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipContent>Fill with AI</TooltipContent>
                <TooltipTrigger asChild>
                  <AIPromptButton
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    mutation={fillQuestionWithAiMutation}
                    onDoubleClick={(e) => e.stopPropagation()}
                  />
                </TooltipTrigger>
              </Tooltip>

              <Tooltip>
                <TooltipContent>Edit</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleEditMode()}
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>

              <Tooltip>
                <TooltipContent>Duplicate</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => duplicateQuestion()}
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>

              <DeleteContentTemplateDialog
                tooltip="Delete"
                loading={deleteQuestionTemplateMutation.isPending}
                onDelete={() => {
                  if (question._new) {
                    deleteQuestion();
                    Toast.s({
                      title: "Item removed!",
                      description: "Your changes saved successfully!",
                    });
                  } else {
                    deleteQuestionTemplateMutation.mutate();
                  }
                }}
                asChild
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <Trash2Icon className="h-4 w-4 text-red-500" />
                </Button>
              </DeleteContentTemplateDialog>

              <Tooltip>
                <TooltipContent>Change Order</TooltipContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-grab"
                    onDoubleClick={(e) => e.stopPropagation()}
                    {...attributes}
                    {...listeners}
                  >
                    <GripVerticalIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {questionType == "multiple_choice" ? (
          <MultiChoiceQuizTemplate
            question={
              tmpQuestion as IChannelQuizContentItem<IChannelQuizMultipleChoiceTemplate>
            }
            onUpdate={updateQuestion}
          />
        ) : questionType == "fill_in_the_blank" ? (
          <FillInBlankQuizTemplate
            question={
              tmpQuestion as IChannelQuizContentItem<IChannelQuizFillInBlankTemplate>
            }
            onUpdate={updateQuestion}
          />
        ) : questionType == "matching" ? (
          <MatchingQuizTemplate
            question={
              tmpQuestion as IChannelQuizContentItem<IChannelQuizMatchingTemplate>
            }
            onUpdate={updateQuestion}
          />
        ) : questionType == "short_answer" ? (
          <ShortAnswerQuizTemplate
            question={
              tmpQuestion as IChannelQuizContentItem<IChannelQuizShortAnswerTemplate>
            }
            onUpdate={updateQuestion}
          />
        ) : questionType == "true_false" ? (
          <TrueFalseQuizTemplate
            question={
              tmpQuestion as IChannelQuizContentItem<IChannelQuizTrueFalseTemplate>
            }
            onUpdate={updateQuestion}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
