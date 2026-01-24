import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useChannelOutline } from "@/providers/channel-outline-provider";
import { IChannelUnitOutline } from "@/types/channel-outline";
import { useMutation } from "@tanstack/react-query";
import { Layers, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import ChannelActivityOutlineItem, {
  ChannelNewActivityOutlineItem,
} from "./channel-outline-item-activity";

type TChannelNewUnitOutlineItemProps = {
  channelId: string;
  sectionId: string;
  lastOrder: number;
  onCreate?: (unit: IChannelUnitOutline) => void;
  onCancel?: () => void;
};

type TChannelUnitOutlineItemProps = {
  channelId: string;
  sectionId: string;
  unit: IChannelUnitOutline;
  indexSequence: number[];
  searchQuery?: string;
};

function ChannelUnitOutlineIcon({ loading }: { loading?: boolean }) {
  return (
    <div className="w-5 h-5 bg-blue-600/90 rounded-md flex items-center justify-center">
      {loading ? (
        <Spinner className="h-3 w-3 text-white" />
      ) : (
        <Layers className="h-3 w-3 text-white" />
      )}
    </div>
  );
}

export function ChannelNewUnitOutlineItem({
  channelId,
  sectionId,
  lastOrder,
  onCreate,
  onCancel,
}: TChannelNewUnitOutlineItemProps) {
  const { refreshToken } = useAuth();
  const { outlineModifier } = useChannelOutline();
  const [name, setName] = useState("");

  const createUnitOutlineMutation = useMutation({
    mutationKey: ["createUnitOutlineMutation"],
    mutationFn: async () => {
      await refreshToken();
      const order = lastOrder + 1;
      const res = await Api.post<IChannelUnitOutline>(
        `/studio/channel/content/${channelId}/units/outline/${order}/`,
        {
          channel_id: channelId,
          section_outline_id: sectionId,
          name: name,
          order: order,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      onCreate?.(data);
      outlineModifier.insert.unit({ sectionId, newItem: data });

      Toast.s({
        title: "New unit created!",
        description: "The new unit added to channel outline.",
      });
    },
  });

  function handleSave() {
    if (name.trim().length > 0) {
      createUnitOutlineMutation.mutate();
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
        <ChannelUnitOutlineIcon loading={createUnitOutlineMutation.isPending} />

        <BlurryInput
          className="flex-1 h-7 bg-background border-input text-foreground text-sm"
          value={name}
          enabled
          placeholder="Enter new unit name"
          disabled={createUnitOutlineMutation.isPending}
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

export default function ChannelUnitOutlineItem({
  channelId,
  sectionId,
  unit,
  indexSequence,
  searchQuery = "",
}: TChannelUnitOutlineItemProps) {
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
  const [name, setName] = useState(unit.name);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const unitIndex = `Unit ${indexSequence.join(".")}`;
  const expanded = isExpanded(unit.id);
  const selected = isSelected(unit.id);

  const saveUnitOutlineMutation = useMutation({
    mutationKey: ["saveUnitOutlineMutation", { id: unit.id }],
    mutationFn: async () => {
      await refreshToken();
      const res = await Api.put<IChannelUnitOutline>(
        `/studio/channel/content/${channelId}/units/outline/${unit.id}/`,
        {
          channel_id: channelId,
          section_outline_id: sectionId,
          name: name,
          order: unit.order,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      setIsEditing(false);

      outlineModifier.update.unit({
        sectionId,
        id: unit.id,
        data,
      });

      Toast.s({
        title: "Unit changes applied!",
        description: "The unit changes recorded on channel outline.",
      });
    },
  });

  function handleSave() {
    if (name.trim().length > 0 && name !== unit.name) {
      saveUnitOutlineMutation.mutate();
    } else {
      setIsEditing(false);
      setName(unit.name);
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
              toggleExpand(unit.id);
              setSelectedContent({
                type: "unit",
                data: unit,
                indexSequence,
                ancestors: { sectionId },
              });
            }
          }}
        >
          <ExpandChevronIcon expanded={expanded}>
            <ChannelUnitOutlineIcon
              loading={saveUnitOutlineMutation.isPending}
            />
          </ExpandChevronIcon>

          {isEditing ? (
            <BlurryInput
              className="flex-1 h-7 bg-background border-input text-foreground text-sm"
              value={name}
              enabled={isEditing}
              placeholder="Enter unit name"
              disabled={saveUnitOutlineMutation.isPending}
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
                  {unitIndex}:
                </span>

                <HighlightText text={unit.name} highlightText={searchQuery} />
              </div>

              <div className="flex items-center opacity-0 group-hover:opacity-100">
                {/* Add button based on item type */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNewActivity(true);
                    toggleExpand(unit.id, { force: "expand" });
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>

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

        {expanded && (
          <div className="ml-4">
            {unit.activities.map((activity, aIndex) => (
              <ChannelActivityOutlineItem
                key={activity.id}
                channelId={channelId}
                sectionId={sectionId}
                unitId={unit.id}
                activity={activity}
                indexSequence={[...indexSequence, aIndex + 1]}
                searchQuery={searchQuery}
              />
            ))}

            {showNewActivity && (
              <ChannelNewActivityOutlineItem
                channelId={channelId}
                sectionId={sectionId}
                unitId={unit.id}
                lastOrder={unit.activities.length}
                onCreate={() => setShowNewActivity(false)}
                onCancel={() => setShowNewActivity(false)}
              />
            )}
          </div>
        )}
      </div>

      <DeleteChannelOutlineItemModal
        channelId={channelId}
        itemId={unit.id}
        name={`${indexSequence}: ${unit.name}`}
        target="units"
        open={isDeleting}
        setOpen={setIsDeleting}
        onDelete={() => {
          outlineModifier.delete.unit({
            sectionId,
            id: unit.id,
          });
        }}
      />
    </>
  );
}
