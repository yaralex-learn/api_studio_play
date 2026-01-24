import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useChannelOutline } from "@/providers/channel-outline-provider";
import { IChannelSectionOutline } from "@/types/channel-outline";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import ChannelUnitOutlineItem, {
  ChannelNewUnitOutlineItem,
} from "./channel-outline-item-unit";

type TChannelNewSectionOutlineItemProps = {
  channelId: string;
  lastOrder: number;
  onCreate?: (section: IChannelSectionOutline) => void;
  onCancel?: () => void;
};

type TChannelSectionOutlineItemProps = {
  channelId: string;
  section: IChannelSectionOutline;
  index: number;
  searchQuery?: string;
};

function ChannelSectionOutlineIcon({ loading }: { loading?: boolean }) {
  return (
    <div className="w-5 h-5 bg-purple-600/90 rounded-md flex items-center justify-center">
      {loading ? (
        <Spinner className="h-3 w-3 text-white" />
      ) : (
        <BookOpen className="h-3 w-3 text-white" />
      )}
    </div>
  );
}

export function ChannelNewSectionOutlineItem({
  channelId,
  lastOrder,
  onCreate,
  onCancel,
}: TChannelNewSectionOutlineItemProps) {
  const { refreshToken } = useAuth();
  const { outlineModifier } = useChannelOutline();
  const [name, setName] = useState("");

  const createSectionOutlineMutation = useMutation({
    mutationKey: ["createSectionOutlineMutation"],
    mutationFn: async () => {
      await refreshToken();
      const order = lastOrder + 1;
      const res = await Api.post<IChannelSectionOutline>(
        `/studio/channel/content/${channelId}/sections/outline/${order}/`,
        {
          channel_id: channelId,
          name: name,
          order: order,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      onCreate?.(data);
      outlineModifier.insert.section(data);

      Toast.s({
        title: "New section created!",
        description: "The new section added to channel outline.",
      });
    },
  });

  function handleSave() {
    if (name.trim().length > 0) {
      createSectionOutlineMutation.mutate();
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
        <ChannelSectionOutlineIcon
          loading={createSectionOutlineMutation.isPending}
        />

        <BlurryInput
          className="flex-1 h-7 bg-background border-input text-foreground text-sm"
          value={name}
          enabled
          placeholder="Enter new section name"
          disabled={createSectionOutlineMutation.isPending}
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

export function ChannelSectionOutlineItem({
  channelId,
  section,
  index,
  searchQuery = "",
}: TChannelSectionOutlineItemProps) {
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
  const [name, setName] = useState(section.name);
  const [showNewUnit, setShowNewUnit] = useState(false);
  const sectionIndex = `Section ${index}`;
  const expanded = isExpanded(section.id);
  const selected = isSelected(section.id);

  const saveSectionOutlineMutation = useMutation({
    mutationKey: ["saveSectionOutlineMutation", { id: section.id }],
    mutationFn: async () => {
      await refreshToken();
      const res = await Api.put<IChannelSectionOutline>(
        `/studio/channel/content/${channelId}/sections/outline/${section.id}/`,
        {
          channel_id: channelId,
          name: name,
          order: section.order,
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      setIsEditing(false);
      outlineModifier.update.section({ id: section.id, data });

      Toast.s({
        title: "Section changes applied!",
        description: "The section changes recorded on channel outline.",
      });
    },
  });

  function handleSave() {
    if (name.trim().length > 0 && name !== section.name) {
      saveSectionOutlineMutation.mutate();
    } else {
      setIsEditing(false);
      setName(section.name);
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
              toggleExpand(section.id);
              setSelectedContent({
                type: "section",
                data: section,
                indexSequence: [index],
              });
            }
          }}
        >
          <ExpandChevronIcon expanded={expanded}>
            <ChannelSectionOutlineIcon
              loading={saveSectionOutlineMutation.isPending}
            />
          </ExpandChevronIcon>

          {isEditing ? (
            <BlurryInput
              className="flex-1 h-7 bg-background border-input text-foreground text-sm"
              value={name}
              enabled={isEditing}
              placeholder="Enter section name"
              disabled={saveSectionOutlineMutation.isPending}
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
                  {sectionIndex}:
                </span>

                <HighlightText
                  text={section.name}
                  highlightText={searchQuery}
                />
              </div>

              <div className="flex items-center opacity-0 group-hover:opacity-100">
                {/* Add button based on item type */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNewUnit(true);
                    toggleExpand(section.id, { force: "expand" });
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
            {section.units.map((unit, uIndex) => (
              <ChannelUnitOutlineItem
                key={unit.id}
                channelId={channelId}
                sectionId={section.id}
                unit={unit}
                indexSequence={[index, uIndex + 1]}
                searchQuery={searchQuery}
              />
            ))}

            {showNewUnit && (
              <ChannelNewUnitOutlineItem
                channelId={channelId}
                sectionId={section.id}
                lastOrder={section.units.length}
                onCreate={() => setShowNewUnit(false)}
                onCancel={() => setShowNewUnit(false)}
              />
            )}
          </div>
        )}
      </div>

      <DeleteChannelOutlineItemModal
        channelId={channelId}
        itemId={section.id}
        name={`${sectionIndex}: ${section.name}`}
        target="sections"
        open={isDeleting}
        setOpen={setIsDeleting}
        onDelete={() => {
          outlineModifier.delete.section(section.id);
        }}
      />
    </>
  );
}
