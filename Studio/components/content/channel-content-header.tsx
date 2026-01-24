import { cn } from "@/lib/utils";
import { useChannelOutline } from "@/providers/channel-outline-provider";
import { PanelLeftIcon, SaveIcon } from "lucide-react";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import { Button } from "../ui/button";

type TChannelContentHeader = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  type: "Section" | "Unit" | "Activity" | "Lesson" | "Quiz";
  name: string;
  indexSequence: number[];
  isSaving: boolean;
  onSave: () => void;
};

export default function ChannelContentHeader({
  type,
  name,
  className,
  indexSequence,
  isSaving,
  onSave,
  ...props
}: TChannelContentHeader) {
  const { toggleSidebar } = useChannelOutline();

  return (
    <div
      className={cn("flex items-center gap-2 mb-4 pb-4 border-b", className)}
      {...props}
    >
      <Button variant="ghost" size="icon" onClick={() => toggleSidebar()}>
        <PanelLeftIcon className="!h-6 !w-6" />
      </Button>

      <h1 className="flex-1 text-2xl font-bold truncate">
        <span className="opacity-45">
          {type} {indexSequence.join(".")}:
        </span>{" "}
        {name}
      </h1>

      <Button
        className="flex items-center gap-2"
        type="submit"
        disabled={isSaving}
        onClick={() => onSave()}
      >
        <SaveIcon className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
