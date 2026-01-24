"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import {
  ChannelQuizQuestionTemplates,
  TChannelQuizQuestionTemplateItem,
} from "@/lib/channel-content";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  IChannelAiGeneratedQuiz,
  IChannelQuizContentItem,
  TChannelQuizQuestionDifficulty,
} from "@/types/channel-content-quiz";
import { useMutation } from "@tanstack/react-query";
import { BanIcon, Minus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import HighlightText from "../highlight-text";
import { Textarea } from "../ui/textarea";
import ExampleQuestionTemplate from "./question-type-example";

type TSelectQuestionAiTemplateModalProps = {
  quizId: string;
  lastOrder: number;
  open: boolean;
  onClose: () => void;
  onGenerate: (...newItems: IChannelQuizContentItem[]) => void;
};

export default function SelectQuestionAiTemplateModal({
  quizId,
  lastOrder,
  open,
  onClose,
  onGenerate,
}: TSelectQuestionAiTemplateModalProps) {
  const { refreshToken } = useAuth();
  const [count, setCount] = useState<number>(1);
  const [points, setPoints] = useState<number>(1);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] =
    useState<TChannelQuizQuestionDifficulty>("intermediate");
  const [selectedTemplate, setSelectedTemplate] =
    useState<TChannelQuizQuestionTemplateItem>(ChannelQuizQuestionTemplates[0]);

  const templates = useMemo(() => {
    const _searchQuery = searchQuery.trim().toLowerCase();
    if (_searchQuery.length > 0) {
      return ChannelQuizQuestionTemplates.filter((qt) =>
        qt.title.toLowerCase().includes(_searchQuery)
      );
    }
    return ChannelQuizQuestionTemplates;
  }, [searchQuery]);

  const generateQuestionWithAiMutation = useMutation({
    mutationKey: ["generateQuestionWithAiMutation", { id: quizId }],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.post<IChannelAiGeneratedQuiz>(
        "/studio/channel/generate-questions/",
        {
          initial_prompt: prompt,
          template_id: selectedTemplate.id,
          difficulty,
          num_questions: count,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      const _now = Date.now();
      onGenerate(
        ...data.questions.map((question, index) => {
          const _newItemId = `new-ai-quiz-content-${
            question.type
          }-item-${lastOrder}-${_now + index}`;
          return {
            _new: true,
            id: _newItemId,
            quiz_outline_id: quizId,
            order: lastOrder,
            points,
            time_limit: timeLimit,
            template: question,
          };
        })
      );

      Toast.s(
        count > 1
          ? {
              title: "Questions were generated!",
              description: "All generated questions were added to the quiz!",
            }
          : {
              title: "Question generated!",
              description: "The generated question has been added to the quiz!",
            }
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Generate Question with AI
          </DialogTitle>
          <DialogDescription>Select one of these templates.</DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* AI Prompt at the top */}
        <div className="mt-1">
          <h3 className="font-medium mb-2">AI Prompt</h3>
          <Textarea
            placeholder="Enter a prompt to guide the AI in generating questions."
            className="min-h-[5rem]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="flex flex-row gap-6">
          {/* Template Types */}
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mb-3"
            />

            <div className="space-y-1">
              {templates.length > 0 ? (
                templates.map((template, index) => {
                  const isSelected = template.type === selectedTemplate.type;
                  return (
                    <div
                      key={`question-template-${template.type}-${index}`}
                      onClick={() => setSelectedTemplate(template)}
                      className={cn(
                        "p-2 rounded-md flex items-center gap-2 cursor-pointer",
                        isSelected
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "hover:bg-muted"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => setSelectedTemplate(template)}
                        className="h-4 w-4 text-primary"
                      />
                      <HighlightText
                        text={template.title}
                        highlightText={searchQuery}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="w-full flex flex-col items-center gap-2 pt-6 text-muted-foreground">
                  <BanIcon className="w-12 h-12" />
                  <p className="font-medium">Not Found!</p>
                </div>
              )}
            </div>
          </div>

          <Separator orientation="vertical" className="h-full" />

          <div className="flex-1">
            <ExampleQuestionTemplate type={selectedTemplate.type} />

            {/* Add points and time limit settings */}
            <div className="mt-4">
              <div className="flex items-center flex-wrap gap-2">
                {/* Count */}
                <span className="h-7 text-xs bg-muted rounded-full flex items-center">
                  <button
                    onClick={() => setCount(Math.max(1, count - 1))}
                    className="px-1 py-1.5 hover:bg-muted-foreground/10 rounded-l-full"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-1 whitespace-nowrap">
                    {count} {count === 1 ? "question" : "questions"}
                  </span>
                  <button
                    onClick={() => setCount(count + 1)}
                    className="px-1 py-1.5 hover:bg-muted-foreground/10 rounded-r-full"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </span>

                {/* Points */}
                <span className="h-7 text-xs bg-muted rounded-full flex items-center">
                  <button
                    onClick={() => setPoints(Math.max(1, points - 1))}
                    className="px-1 py-1.5 hover:bg-muted-foreground/10 rounded-l-full"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-1 whitespace-nowrap">
                    {points} {points === 1 ? "point" : "points"}
                  </span>
                  <button
                    onClick={() => setPoints(points + 1)}
                    className="px-1 py-1.5 hover:bg-muted-foreground/10 rounded-r-full"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </span>

                {/* Time Limit */}
                <Select
                  value={timeLimit != null ? `${timeLimit}` : "no-limit"}
                  onValueChange={(value) =>
                    setTimeLimit(value === "no-limit" ? null : parseInt(value))
                  }
                >
                  <SelectTrigger className="max-w-[9rem] h-7 text-xs bg-muted rounded-full border-none">
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

                {/* Difficulty */}
                <Select
                  value={difficulty}
                  onValueChange={(value: TChannelQuizQuestionDifficulty) =>
                    setDifficulty(value)
                  }
                >
                  <SelectTrigger className="max-w-[9rem] h-7 text-xs bg-muted rounded-full border-none">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            disabled={generateQuestionWithAiMutation.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            onClick={() => generateQuestionWithAiMutation.mutate()}
            disabled={
              prompt.trim().length === 0 ||
              generateQuestionWithAiMutation.isPending
            }
          >
            {generateQuestionWithAiMutation.isPending
              ? "Generating..."
              : "Generate with AI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
