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
import { ChannelQuizQuestionTemplates } from "@/lib/channel-content";
import { cn } from "@/lib/utils";
import {
  ChannelQuizTemplateID,
  IChannelQuizContentItem,
  IChannelQuizFillInBlankTemplate,
  IChannelQuizMatchingTemplate,
  IChannelQuizMultipleChoiceTemplate,
  IChannelQuizShortAnswerTemplate,
  IChannelQuizTemplate,
  IChannelQuizTrueFalseTemplate,
  TChannelQuizContentType,
} from "@/types/channel-content-quiz";
import { BanIcon, Minus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import HighlightText from "../highlight-text";
import ExampleQuestionTemplate from "./question-type-example";

interface SelectQuestionTemplateModalProps {
  quizId: string;
  lastOrder: number;
  open: boolean;
  onClose: () => void;
  onSelect: (newItem: IChannelQuizContentItem) => void;
}

export default function SelectQuestionTemplateModal({
  quizId,
  lastOrder,
  open,
  onClose,
  onSelect,
}: SelectQuestionTemplateModalProps) {
  const [points, setPoints] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [selectedType, setSelectedType] =
    useState<TChannelQuizContentType>("multiple_choice");

  const templates = useMemo(() => {
    const _searchQuery = searchQuery.trim().toLowerCase();
    if (_searchQuery.length > 0) {
      return ChannelQuizQuestionTemplates.filter((qt) =>
        qt.title.toLowerCase().includes(_searchQuery)
      );
    }
    return ChannelQuizQuestionTemplates;
  }, [searchQuery]);

  const handleSelect = () => {
    const _newItemId = `new-quiz-content-${selectedType}-item-${lastOrder}-${Date.now()}`;
    let _template: IChannelQuizTemplate;

    switch (selectedType) {
      case "multiple_choice":
        _template = {
          id: ChannelQuizTemplateID.MULTIPLE_CHOICE,
          type: "multiple_choice",
          question: "",
          correct_answer: "",
          options: ["", ""],
        } as IChannelQuizMultipleChoiceTemplate;
        break;

      case "fill_in_the_blank":
        _template = {
          id: ChannelQuizTemplateID.FILL_IN_THE_BLANK,
          type: "fill_in_the_blank",
          question: "",
          blanks: [] as string[],
          options: [] as string[][],
        } as IChannelQuizFillInBlankTemplate;
        break;

      case "true_false":
        _template = {
          id: ChannelQuizTemplateID.TRUE_FALSE,
          type: "true_false",
          question: "",
          correct_answer: true,
        } as IChannelQuizTrueFalseTemplate;
        break;

      case "matching":
        _template = {
          id: ChannelQuizTemplateID.MATCHING,
          type: "matching",
          question: "",
          options: ["", ""],
          pairs: ["", ""],
        } as IChannelQuizMatchingTemplate;
        break;

      case "short_answer":
        _template = {
          id: ChannelQuizTemplateID.SHORT_ANSWER,
          type: "short_answer",
          question: "",
          correct_answer: "",
        } as IChannelQuizShortAnswerTemplate;
        break;
    }

    onSelect({
      _new: true,
      id: _newItemId,
      quiz_outline_id: quizId,
      order: lastOrder,
      points,
      time_limit: timeLimit,
      template: _template,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Question Templates</DialogTitle>
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

        <div className="flex flex-row gap-6 mt-2">
          {/* Template Types */}
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mb-3"
            />

            <div className="space-y-1">
              {templates.length > 0 ? (
                templates.map((template, index) => (
                  <div
                    key={`question-template-${template.type}-${index}`}
                    onClick={() => setSelectedType(template.type)}
                    className={cn(
                      "p-2 rounded-md flex items-center gap-2 cursor-pointer",
                      selectedType === template.type
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "hover:bg-muted"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedType === template.type}
                      onChange={() => setSelectedType(template.type)}
                      className="h-4 w-4 text-primary"
                    />
                    <HighlightText
                      text={template.title}
                      highlightText={searchQuery}
                    />
                  </div>
                ))
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
            <ExampleQuestionTemplate type={selectedType} />

            {/* Add points and time limit settings */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect}>Select Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
