"use client";

import type React from "react";

import { DeleteChannelDialog } from "@/components/dialogs/delete-channel-dialog";
import { DuplicateChannelDialog } from "@/components/dialogs/duplicate-channel-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { IChannelItem } from "@/types/channel";
import toFileUrl from "@/utils/to-file-url";
import { useQueryClient } from "@tanstack/react-query";
import {
  Book,
  CheckSquare,
  Copy,
  FileText,
  HelpCircle,
  Layers,
  MoreVertical,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Simple utility function to join class names
function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface ChannelCardProps {
  channel: IChannelItem;
}

type ActionType = "duplicate" | "delete" | null;

export function ChannelCard({ channel }: ChannelCardProps) {
  const queryClient = useQueryClient();
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const openDialog = (action: ActionType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (action === "duplicate") {
      setShowDuplicateDialog(true);
    } else if (action === "delete") {
      setShowDeleteDialog(true);
    }
  };

  return (
    <>
      <Link href={`/channels/${channel.channel_id}/content`}>
        <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors relative">
          {/* More Actions Button - Positioned at top-right */}
          <div className="absolute top-4 right-4 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => openDialog("duplicate", e)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => openDialog("delete", e)}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="p-6 flex">
            {/* Channel Avatar */}
            <div className="mr-4 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                {channel.avatar_file_id ? (
                  <img
                    className="w-full h-full object-cover"
                    src={toFileUrl(channel.avatar_file_id)}
                    alt="Avatar"
                    loading="lazy"
                    decoding="async"
                    data-nimg="1"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-neutral-600 text-2xl font-bold">
                    {channel.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold dark:text-white">
                  {channel.name}
                </h3>
                {channel.published ? (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-600 text-white">
                    Published
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-600 text-white">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-neutral-400 mb-4">
                {channel.description}
              </p>

              <div
                className={classNames(
                  "flex items-center gap-4 text-gray-500 dark:text-neutral-400 text-sm mt-auto"
                )}
              >
                <div className="flex items-center">
                  <Book className={classNames("h-4 w-4 me-1")} />
                  {channel.section_count} Sections
                </div>
                <div className="flex items-center">
                  <Layers className={classNames("h-4 w-4 me-1")} />
                  {channel.unit_count} Units
                </div>
                <div className="flex items-center">
                  <CheckSquare className={classNames("h-4 w-4 me-1")} />
                  {channel.activity_count} Activities
                </div>
                <div className="flex items-center">
                  <FileText className={classNames("h-4 w-4 me-1")} />
                  {channel.lesson_count} Lessons
                </div>
                <div className="flex items-center">
                  <HelpCircle className={classNames("h-4 w-4 me-1")} />
                  {channel.quiz_count} Quizzes
                </div>
              </div>
            </div>

            <div className="min-w-[280px] min-h-full flex flex-col items-end justify-end">
              <div className="flex items-center justify-start text-gray-500 dark:text-neutral-400">
                <Users className="h-4 w-4 me-1" />
                <span>
                  <span className="font-medium dark:text-white">
                    {channel.enrolled_students}
                  </span>{" "}
                  students enrolled
                </span>
              </div>
              <div className="text-gray-500 dark:text-neutral-500 text-sm mt-1">
                Updated {formatDate(channel.last_updated)}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Duplicate Dialog */}
      <DuplicateChannelDialog
        channelId={channel.channel_id}
        channelTitle={channel.name}
        isOpen={showDuplicateDialog}
        onClose={() => setShowDuplicateDialog(false)}
      />

      {/* Delete Dialog */}
      <DeleteChannelDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onRemoved={() =>
          queryClient.invalidateQueries({
            queryKey: ["getChannelsInfiniteQuery"],
            exact: true,
          })
        }
        channelId={channel.channel_id}
        channelTitle={channel.name}
      />
    </>
  );
}
