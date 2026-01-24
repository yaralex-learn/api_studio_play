import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useChannelOutline } from "@/providers/channel-outline-provider";
import { IChannelActivityOutline } from "@/types/channel-outline";
import { useMutation } from "@tanstack/react-query";
import {
  CheckSquare,
  FileText,
  HelpCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import HighlightText from "../highlight-text";
import ExpandChevronIcon from "../icon-expand-chevron";
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
import ChannelContentOutlineItem, {
  ChannelNewContentOutlineItem,
} from "./channel-outline-item-content";

type TChannelNewActivityOutlineItemProps = {
  channelId: string;
  sectionId: string;
  unitId: string;
  lastOrder: number;
  onCreate?: (activity: IChannelActivityOutline) => void;
  onCancel?: () => void;
};

type TChannelActivityOutlineItemProps = {
  channelId: string;
  sectionId: string;
  unitId: string;
  activity: IChannelActivityOutline;
  indexSequence: number[];
  searchQuery?: string;
};

function ChannelActivityOutlineIcon({ loading }: { loading?: boolean }) {
  return (
    <div className="w-5 h-5 bg-green-600/90 rounded-md flex items-center justify-center">
      {loading ? (
        <Spinner className="h-3 w-3 text-white" />
      ) : (
        <CheckSquare className="h-3 w-3 text-white" />
      )}
    </div>
  );
}

export function ChannelNewActivityOutlineItem({
  channelId,
  sectionId,
  unitId,
  lastOrder,
  onCreate,
  onCancel,
}: TChannelNewActivityOutlineItemProps) {
  const { refreshToken } = useAuth();
  const { outlineModifier } = useChannelOutline();
  const [name, setName] = useState("");

  const createActivityOutlineMutation = useMutation({
    mutationKey: ["createActivityOutlineMutation"],
    mutationFn: async () => {
      await refreshToken();
      const order = lastOrder + 1;
      const res = await Api.post<IChannelActivityOutline>(
        `/studio/channel/content/${channelId}/activities/outline/${order}/`,
        {
          channel_id: channelId,
          unit_outline_id: unitId,
          name: name,
          order: order,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      onCreate?.(data);

      outlineModifier.insert.activity({
        sectionId,
        unitId,
        newItem: data,
      });

      Toast.s({
        title: "New activity created!",
        description: "The new activity added to channel outline.",
      });
    },
  });

  function handleSave() {
    if (name.trim().length > 0) {
      createActivityOutlineMutation.mutate();
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
        <ChannelActivityOutlineIcon
          loading={createActivityOutlineMutation.isPending}
        />

        <BlurryInput
          className="flex-1 h-7 bg-background border-input text-foreground text-sm"
          value={name}
          enabled
          placeholder="Enter new activity name"
          disabled={createActivityOutlineMutation.isPending}
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

export default function ChannelActivityOutlineItem({
  channelId,
  sectionId,
  unitId,
  activity,
  indexSequence,
  searchQuery = "",
}: TChannelActivityOutlineItemProps) {
  const { refreshToken } = useAuth();
  const {
    outlineModifier,
    isExpanded,
    isSelected,
    toggleExpand,
    setSelectedContent,
  } = useChannelOutline();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState(activity.name);
  const [showNewContentByType, setShowNewContentByType] = useState<
    "lesson" | "quiz" | null
  >(null);
  const activityIndex = `Activity ${indexSequence.join(".")}`;
  const expanded = isExpanded(activity.id);
  const selected = isSelected(activity.id);

  const saveActivityOutlineMutation = useMutation({
    mutationKey: ["saveActivityOutlineMutation", { id: activity.id }],
    mutationFn: async () => {
      await refreshToken();
      const res = await Api.put<IChannelActivityOutline>(
        `/studio/channel/content/${channelId}/activities/outline/${activity.id}/`,
        {
          channel_id: channelId,
          unit_outline_id: unitId,
          name: name,
          order: activity.order,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      setIsEditing(false);

      outlineModifier.update.activity({
        sectionId,
        unitId,
        id: activity.id,
        data,
      });

      Toast.s({
        title: "Activity changes applied!",
        description: "The activity changes recorded on channel outline.",
      });
    },
  });

  function handleSave() {
    if (name.trim().length > 0 && name !== activity.name) {
      saveActivityOutlineMutation.mutate();
    } else {
      setIsEditing(false);
      setName(activity.name);
    }
  }

  return (
    <>
      <div className="w-full mt-1">
        <div
          className={cn(
            "w-full flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer group",
            selected
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={() => {
            if (!isEditing && !isDeleting) {
              toggleExpand(activity.id);
              setSelectedContent({
                type: "activity",
                data: activity,
                indexSequence,
                ancestors: { sectionId, unitId },
              });
            }
          }}
        >
          <ExpandChevronIcon expanded={expanded}>
            <ChannelActivityOutlineIcon
              loading={saveActivityOutlineMutation.isPending}
            />
          </ExpandChevronIcon>

          {isEditing ? (
            <BlurryInput
              className="flex-1 h-7 bg-background border-input text-foreground text-sm"
              value={name}
              enabled={isEditing}
              placeholder="Enter activity name"
              disabled={saveActivityOutlineMutation.isPending}
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
                  {activityIndex}:
                </span>

                <HighlightText
                  text={activity.name}
                  highlightText={searchQuery}
                />
              </div>

              <div className="flex items-center opacity-0 group-hover:opacity-100">
                {/* Add button based on item type */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNewContentByType("lesson");
                        toggleExpand(activity.id, { force: "expand" });
                      }}
                    >
                      <FileText className="h-3.5 w-3.5 mr-2" />
                      <span>Lesson</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNewContentByType("quiz");
                        toggleExpand(activity.id, { force: "expand" });
                      }}
                    >
                      <HelpCircle className="h-3.5 w-3.5 mr-2" />
                      <span>Quiz</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

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

        {isExpanded(activity.id) && (
          <div className="ml-4">
            {activity.content.map((content, cIndex) => (
              <ChannelContentOutlineItem
                key={content.id}
                channelId={channelId}
                sectionId={sectionId}
                unitId={unitId}
                activityId={activity.id}
                content={content}
                indexSequence={[...indexSequence, cIndex + 1]}
                searchQuery={searchQuery}
              />
            ))}

            {showNewContentByType && (
              <ChannelNewContentOutlineItem
                channelId={channelId}
                sectionId={sectionId}
                unitId={unitId}
                activityId={activity.id}
                type={showNewContentByType}
                lastOrder={activity.content.length}
                onCreate={() => setShowNewContentByType(null)}
                onCancel={() => setShowNewContentByType(null)}
              />
            )}
          </div>
        )}
      </div>

      <DeleteChannelOutlineItemModal
        channelId={channelId}
        itemId={activity.id}
        name={`${activityIndex}: ${activity.name}`}
        target="activities"
        open={isDeleting}
        setOpen={setIsDeleting}
        onDelete={() => {
          outlineModifier.delete.activity({
            sectionId,
            unitId,
            id: activity.id,
          });
        }}
      />
    </>
  );
}
