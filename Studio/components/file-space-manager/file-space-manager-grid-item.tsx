import { cn } from "@/lib/utils";
import { IFileItem, TFileSpaceSelectionType } from "@/types/file-space";
import { FolderClosedIcon } from "lucide-react";
import { useMemo } from "react";
import HighlightText from "../highlight-text";
import FileSpaceIcon from "./file-space-icon";

type TFileSpaceManagerGridItemProps = {
  data: IFileItem;
  isSelected: boolean;
  isCutting: boolean;
  searchQuery?: string;
  selectionFileType?: TFileSpaceSelectionType;
  onSelect?: (data: IFileItem) => void;
  onDoubleClickDir?: (data: IFileItem) => void;
};

export default function FileSpaceManagerGridItem({
  data,
  isSelected,
  isCutting,
  searchQuery,
  selectionFileType,
  onSelect,
  onDoubleClickDir,
}: TFileSpaceManagerGridItemProps) {
  const isDirectory = data.contents != null;

  const isSelectable = useMemo(() => {
    if (isDirectory || !selectionFileType || selectionFileType === "all") {
      return true;
    }

    const extension = data.name.substring(
      data.name.lastIndexOf(".") + 1,
      data.name.length
    );

    switch (selectionFileType) {
      case "image":
        return ["jpg", "jpeg", "png", "webp"].includes(extension);

      case "video":
        return ["mp4", "webm", "mov", "avi", "mkv"].includes(extension);

      case "audio":
        return ["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(extension);

      case "doc":
        return ["pdf", "doc", "docx"].includes(extension);

      case "presentation":
        return ["ppt", "pptx"].includes(extension);

      case "spreadsheet":
        return ["xls", "xlsx"].includes(extension);

      case "archive":
        return ["zip", "rar", "7z", "tar"].includes(extension);

      default:
        return false;
    }
  }, [isDirectory, selectionFileType]);

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center gap-1 p-3 rounded-md",
        isSelectable ? "cursor-pointer" : "opacity-35 cursor-not-allowed",
        isSelected ? "bg-secondary/35" : "hover:bg-secondary/15",
        isCutting && "opacity-50"
      )}
      onClick={() => {
        if (isSelectable) {
          onSelect?.(data);
        }
      }}
      onDoubleClick={() => {
        if (isDirectory) {
          onDoubleClickDir?.(data);
        }
      }}
    >
      {isDirectory ? (
        <FolderClosedIcon className="text-amber-500 h-11 w-11" />
      ) : (
        <FileSpaceIcon fileName={data.name} className="h-11 w-11" />
      )}

      <HighlightText
        className="w-full font-medium truncate text-xs"
        text={data.name}
        highlightText={searchQuery ?? ""}
      />
    </div>
  );
}
