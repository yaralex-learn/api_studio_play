"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface TDeleteChannelOutlineItemModalProps {
  channelId: string;
  itemId: string;
  name: string;
  target: "sections" | "units" | "activities" | "lessons" | "quizzes";
  open: boolean;
  setOpen: (open: boolean) => void;
  onDelete?: () => void;
}

export function DeleteChannelOutlineItemModal({
  channelId,
  itemId,
  name,
  target,
  open,
  setOpen,
  onDelete,
}: TDeleteChannelOutlineItemModalProps) {
  const { refreshToken } = useAuth();
  const [] = useState(false);

  const deleteChannelOutlineItemMutation = useMutation({
    mutationKey: ["deleteChannelOutlineItemMutation", { id: itemId, target }],
    mutationFn: async () => {
      await refreshToken();
      const res = await Api.delete(
        `/studio/channel/content/${channelId}/${target}/outline/${itemId}/`
      );
      return res.data;
    },
    onSuccess: () => {
      setOpen(false);
      onDelete?.();
      Toast.s({
        title: "Outline item deleted!",
        description: "The item deleted from channel outline!",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Outline Item
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-3">
                Are you sure you want to delete this <b>"{name}"</b>? This
                action cannot be undone.
              </p>

              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> Deleting this item will also
                    delete all subitems inside it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteChannelOutlineItemMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteChannelOutlineItemMutation.mutate()}
            disabled={deleteChannelOutlineItemMutation.isPending}
          >
            {deleteChannelOutlineItemMutation.isPending
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
