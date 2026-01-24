import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

type TDifficultySliderProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  description?: string;
};

export default function DifficultySlider({
  value,
  onChange,
  label,
  description,
}: TDifficultySliderProps) {
  // Function to get difficulty label based on slider value
  const difficultyLabel = useMemo(() => {
    switch (value) {
      case 0:
        return "Beginner";
      case 1:
        return "Easy";
      case 2:
        return "Medium";
      case 3:
        return "Hard";
      case 4:
        return "Expert";
      default:
        return "Medium";
    }
  }, [value]);

  // Function to get color based on difficulty
  const difficultyColor = useMemo(() => {
    switch (value) {
      case 0:
        return "bg-green-300 text-gray-50 dark:text-black";
      case 1:
        return "bg-green-500 text-gray-50 dark:text-black";
      case 2:
        return "bg-yellow-500 text-gray-50 dark:text-black";
      case 3:
        return "bg-orange-500 text-gray-50 dark:text-black";
      case 4:
        return "bg-red-500 text-gray-50 dark:text-black";
      default:
        return "bg-yellow-900 text-gray-50 dark:text-black";
    }
  }, [value]);

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-start justify-between mb-2">
        <div className="flex flex-col items-start">
          {label && <Label className="text-md font-medium">{label}</Label>}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        <span
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium border",
            difficultyColor
          )}
        >
          {difficultyLabel}
        </span>
      </div>

      <Slider
        max={4}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Beginner</span>
        <span>Easy</span>
        <span>Medium</span>
        <span>Hard</span>
        <span>Expert</span>
      </div>
    </div>
  );
}
