"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { IChannelItem } from "@/types/channel";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PublishChannelDialogProps {
  channelId: string;
  isPublished: boolean;
  asChild?: boolean;
  onChange?: (published: boolean) => void;
}

export function PublishChannelDialog({
  channelId,
  isPublished,
  asChild,
  children,
  onChange,
}: PropsWithChildren<PublishChannelDialogProps>) {
  const { refreshToken } = useAuth();
  const [open, onOpenChange] = useState(false);
  const [published, setPublished] = useState(isPublished);

  useEffect(() => setPublished(isPublished), [isPublished]);

  const publishChannelMutation = useMutation({
    mutationKey: ["publishChannelMutation", { channelId }],
    mutationFn: async () => {
      await refreshToken();
      const res = await Api.patch<IChannelItem>(
        `/studio/channel/setting/${channelId}/publish/`,
        {
          channel_id: channelId,
          published,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      Toast.s({
        title: "Changes applied!",
        description: `You're channel ${
          published ? "published" : "unpublished"
        } successfully.`,
      });

      onOpenChange(false);
      onChange?.(published);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="h-5 w-5" />
            Publish Channel
          </DialogTitle>
          <DialogDescription>
            By publishing the channel, the data will be accessible to students,
            and by unpublishing it, the channel will be inaccessible to
            students. Are you sure?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="publish_status" className="block font-medium">
            Publish Status
          </Label>

          <Select
            name="publish_status"
            value={`${published}`}
            disabled={publishChannelMutation.isPending}
            onValueChange={(v) => setPublished(v === "true")}
          >
            <SelectTrigger id="publish_status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Publish</SelectItem>
              <SelectItem value="false">Unpublish</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={publishChannelMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => publishChannelMutation.mutate()}
            disabled={publishChannelMutation.isPending}
          >
            {publishChannelMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {published ? "Publishing..." : "Unpublishing..."}
              </>
            ) : (
              <>{published ? "Publish" : "Unpublish"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
