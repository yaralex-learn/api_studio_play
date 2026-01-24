import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusCircleIcon, Sparkles } from "lucide-react";

type TQuizTemplateDividerProps = {
  alwaysVisible?: boolean;
  onAddQuestion: () => void;
  onGenerateAI: () => void;
};

export default function QuizTemplateDivider({
  onAddQuestion,
  onGenerateAI,
  alwaysVisible = false,
}: TQuizTemplateDividerProps) {
  return (
    <div
      className={cn(
        "w-full group relative transition-all duration-200",
        alwaysVisible ? "py-8" : "cursor-crosshair py-2 hover:py-7"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200",
          alwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <div className="flex-1 border-b border-dashed" />

        <Button
          variant="outline"
          size="sm"
          className="py-0 px-2.5 text-sm"
          onClick={() => onAddQuestion()}
        >
          <PlusCircleIcon className="h-2 w-2" /> Add Question
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="py-0 px-2.5 text-sm"
          onClick={() => onGenerateAI()}
        >
          <Sparkles className="h-2 w-2" /> Generate with AI
        </Button>

        <div className="flex-1 border-b border-dashed" />
      </div>
    </div>
  );
}
