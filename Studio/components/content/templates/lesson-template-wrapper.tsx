"use client";

import type React from "react";

import { AIPromptButton } from "@/components/ai-prompt-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useChannel } from "@/providers/channel-provider";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { CopyIcon, Trash2Icon } from "lucide-react";
import DeleteContentTemplateDialog from "../delete-template-modal";

interface TemplateWrapperProps<T = any> {
  itemId: string;
  isNew?: boolean | null;
  children: React.ReactNode;
  className?: string;
  onDelete: () => void;
  onDuplicate: () => void;
  aiMutation?: UseMutationResult<T, Error, string, unknown>;
}

export default function TemplateWrapper<T>({
  itemId,
  isNew,
  children,
  className,
  onDelete,
  onDuplicate,
  aiMutation,
}: TemplateWrapperProps<T>) {
  const { refreshToken } = useAuth();
  const { channel } = useChannel();

  const deleteLessonTemplateMutation = useMutation({
    mutationKey: ["deleteLessonTemplateMutation", { id: itemId }],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.delete(
        `/studio/channel/content/${channel.channel_id}/lessons/${itemId}/`
      );
      return res.data;
    },
    onSuccess: () => {
      onDelete();
      Toast.s({
        title: "Item removed!",
        description: "Your changes saved successfully!",
      });
    },
  });

  return (
    <>
      <div className={cn("relative", className)}>
        <div className="w-full max-w-3xl flex flex-col gap-4 mx-auto">
          <Card className="w-full p-4">{children}</Card>

          <div className="flex flex-row gap-2 self-end">
            {aiMutation && (
              <Tooltip>
                <TooltipContent side="bottom">Fill with AI</TooltipContent>
                <TooltipTrigger asChild>
                  <AIPromptButton
                    variant="secondary"
                    className="h-8 w-8 rounded-md shadow-md"
                    mutation={aiMutation}
                  />
                </TooltipTrigger>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipContent side="bottom">Duplicate</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={onDuplicate}
                  className="h-8 w-8 rounded-md shadow-md"
                  title="Duplicate"
                >
                  <CopyIcon className="h-4 w-4 text-blue-500" />
                </Button>
              </TooltipTrigger>
            </Tooltip>

            <DeleteContentTemplateDialog
              tooltip="Delete"
              loading={deleteLessonTemplateMutation.isPending}
              onDelete={() => {
                if (isNew) {
                  onDelete();
                  Toast.s({
                    title: "Item removed!",
                    description: "Your changes saved successfully!",
                  });
                } else {
                  deleteLessonTemplateMutation.mutate();
                }
              }}
              asChild
            >
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-md shadow-md"
                title="Delete"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </DeleteContentTemplateDialog>
          </div>
        </div>
      </div>
    </>
  );
}
