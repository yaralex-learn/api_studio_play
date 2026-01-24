import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useChannelOutline } from "@/providers/channel-outline-provider";
import { IChannelContentOutline } from "@/types/channel-outline";
import { useMutation } from "@tanstack/react-query";
import {
  FileText,
  HelpCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import HighlightText from "../highlight-text";
import BlurryInput from "../input-blurry";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Spinner } from "../ui/spinner";
import { DeleteChannelOutlineItemModal } from "./channel-outline-delete-modal";

type TChannelNewContentOutlineItemProps = {
  channelId: string;
  sectionId: string;
  unitId: string;
  activityId: string;
  type: "lesson" | "quiz";
  lastOrder: number;
  onCreate?: (content: IChannelContentOutline) => void;
  onCancel?: () => void;
};

type TChannelContentOutlineItemProps = {
  channelId: string;
  sectionId: string;
  unitId: string;
  activityId: string;
  content: IChannelContentOutline;
  indexSequence: number[];
  searchQuery?: string;
};

function ChannelContentOutlineIcon({
  type,
  loading,
}: {
  type: "lesson" | "quiz";
  loading?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-5 h-5 rounded-md flex items-center justify-center",
        type === "lesson" ? "bg-orange-600/90" : "bg-indigo-600/90"
      )}
    >
      {loading ? (
        <Spinner className="h-3 w-3 text-white" />
      ) : type === "lesson" ? (
        <FileText className="h-3 w-3 text-white" />
      ) : (
        <HelpCircle className="h-3 w-3 text-white" />
      )}
    </div>
  );
}

export function ChannelNewContentOutlineItem({
  channelId,
  sectionId,
  unitId,
  activityId,
  type,
  lastOrder,
  onCreate,
  onCancel,
}: TChannelNewContentOutlineItemProps) {
  const { refreshToken } = useAuth();
  const { outlineModifier } = useChannelOutline();
  const [name, setName] = useState("");

  const createContentOutlineMutation = useMutation({
    mutationKey: ["createContentOutlineMutation"],
    mutationFn: async () => {
      await refreshToken();
      const order = lastOrder + 1;
      const res = await Api.post<IChannelContentOutline>(
        `/studio/channel/content/${channelId}/${
          type === "lesson" ? "lessons" : "quizzes"
        }/outline/${order}/`,
        {
          channel_id: channelId,
          activity_outline_id: activityId,
          name: name,
          order: order,
          // TODO: Remove these unnecessary fields
          lesson_type: "video",
          quiz_count: 1,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      onCreate?.(data);

      outlineModifier.insert.content({
        sectionId,
        unitId,
        activityId,
        newItem: { ...data, type },
      });

      Toast.s({
        title: `New ${type} created!`,
        description: `The new ${type} added to channel outline.`,
      });
    },
  });

  function handleSave() {
    if (name.trim().length > 0) {
      createContentOutlineMutation.mutate();
    } else {
      onCancel?.();
    }
  }

  return (
    <div
      className={cn(
        "w-[calc(100%-1.25rem)] ml-5", // Because there is no ExpandChevronIcon!
        "mt-1"
      )}
    >
      <div className="flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer group">
        <ChannelContentOutlineIcon
          type={type}
          loading={createContentOutlineMutation.isPending}
        />

        <BlurryInput
          className="flex-1 h-7 bg-background border-input text-foreground text-sm"
          value={name}
          enabled
          placeholder={`Enter new ${type} name`}
          disabled={createContentOutlineMutation.isPending}
          onChange={(e) => setName(e.target.value)}
          onBlurred={() => handleSave()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSave();
            }
          }}
        />
      </div>
    </div>
  );
}

export default function ChannelContentOutlineItem({
  channelId,
  sectionId,
  unitId,
  activityId,
  content,
  indexSequence,
  searchQuery = "",
}: TChannelContentOutlineItemProps) {
  const { refreshToken } = useAuth();
  const { outlineModifier, isSelected, setSelectedContent } =
    useChannelOutline();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState(content.name);
  const contentType = content.type === "lesson" ? "Lesson" : "Quiz";
  const contentIndex = `${contentType} ${indexSequence.join(".")}`;
  const selected = isSelected(content.id);

  const saveContentOutlineMutation = useMutation({
    mutationKey: ["saveContentOutlineMutation", { id: content.id }],
    mutationFn: async () => {
      await refreshToken();
      const res = await Api.put<IChannelContentOutline>(
        `/studio/channel/content/${channelId}/${
          content.type === "lesson" ? "lessons" : "quizzes"
        }/outline/${content.id}/`,
        {
          channel_id: channelId,
          activity_outline_id: activityId,
          name: name,
          order: content.order,
          // TODO: Remove these unnecessary fields
          lesson_type: "video",
          quiz_count: 1,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      setIsEditing(false);

      outlineModifier.update.content({
        sectionId,
        unitId,
        activityId,
        id: content.id,
        data,
      });

      Toast.s({
        title: `${contentType} changes applied!`,
        description: `The ${contentType.toLowerCase()} changes recorded on channel outline.`,
      });
    },
  });

  function handleSave() {
    if (name.trim().length > 0 && name !== content.name) {
      saveContentOutlineMutation.mutate();
    } else {
      setIsEditing(false);
      setName(content.name);
    }
  }

  return (
    <>
      <div
        className={cn(
          "w-[calc(100%-1.25rem)] ml-5", // Because there is no ExpandChevronIcon!
          "flex items-center gap-2 py-2 px-2 mt-1 rounded-md cursor-pointer group",
          selected
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => {
          if (!isEditing && !isDeleting) {
            setSelectedContent({
              type: content.type,
              data: content,
              indexSequence,
              ancestors: { sectionId, unitId, activityId },
            });
          }
        }}
      >
        <ChannelContentOutlineIcon
          type={content.type}
          loading={saveContentOutlineMutation.isPending}
        />

        {isEditing ? (
          <BlurryInput
            className="flex-1 h-7 bg-background border-input text-foreground text-sm"
            value={name}
            enabled={isEditing}
            placeholder={`Enter ${contentType.toLowerCase()} name`}
            disabled={saveContentOutlineMutation.isPending}
            onChange={(e) => setName(e.target.value)}
            onBlurred={() => handleSave()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
          />
        ) : (
          <>
            <div className="flex-1 truncate text-sm">
              <span className="font-medium text-muted-foreground mr-1">
                {contentIndex}:
              </span>

              <HighlightText text={content.name} highlightText={searchQuery} />
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100">
              {/* More options dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    <span>Edit</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-red-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeleting(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>

      <DeleteChannelOutlineItemModal
        channelId={channelId}
        itemId={content.id}
        name={`${contentIndex}: ${content.name}`}
        target={content.type === "lesson" ? "lessons" : "quizzes"}
        open={isDeleting}
        setOpen={setIsDeleting}
        onDelete={() => {
          outlineModifier.delete.content({
            sectionId,
            unitId,
            activityId,
            id: content.id,
          });
        }}
      />
    </>
  );
}
