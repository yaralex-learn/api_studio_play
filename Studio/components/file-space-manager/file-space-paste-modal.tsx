"use client";

import Api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { QUERY_GET_FILE_SPACE_INFO_KEY } from "@/lib/constants";
import Toast from "@/lib/toast";
import { IFileItem } from "@/types/file-space";
import formatFileSize from "@/utils/format-file-size";
import { AlertTriangle, File, FolderClosedIcon } from "lucide-react";
import { Separator } from "../ui/separator";

interface FileSpacePasteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: IFileItem;
  targetDir?: IFileItem | null;
  homeTotalItems: number;
  onPaste?: () => void;
}

export function FileSpacePasteModal({
  open,
  onOpenChange,
  item,
  targetDir,
  homeTotalItems,
  onPaste,
}: FileSpacePasteModalProps) {
  const { refreshToken } = useAuth();
  const queryClient = useQueryClient();

  const moveFileSpaceItemMutation = useMutation({
    mutationKey: ["moveFileSpaceItemMutation", { id: item.id }],
    mutationFn: async () => {
      await refreshToken();
      const res = await Api.put(`/studio/space/file/${item.id}/`, {
        parent_id: targetDir?.id ?? null,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_GET_FILE_SPACE_INFO_KEY,
      });

      Toast.s({
        title: "The file moved!",
        description: "The file moved to new location!",
      });

      onOpenChange(false);
      onPaste?.();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Paste file here
          </DialogTitle>
          <DialogDescription>
            After the transfer, the file can be moved again. Are you sure you
            want to move the file to this folder?
          </DialogDescription>
        </DialogHeader>

        <div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <File className="h-8 w-8 text-gray-500 mt-1" />

                <div className="flex-1 min-w-0">
                  <h4
                    className="font-medium text-sm mb-1 truncate"
                    title={item.name}
                  >
                    {item.name}
                  </h4>
                  <p className="text-xs text-muted-foreground space-y-1">
                    Size: {formatFileSize(item.total_size ?? item.size ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-row items-center gap-2 my-3">
            <Separator className="flex-1" />
            <p className="text-muted-foreground/45 text-xs">Moving To</p>
            <Separator className="flex-1" />
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FolderClosedIcon className="h-8 w-8 text-amber-500 mt-1" />

                <div className="flex-1 min-w-0">
                  <h4
                    className="font-medium text-sm mb-1 truncate"
                    title={targetDir?.name ?? "Home"}
                  >
                    {targetDir?.name ?? "Home"}
                  </h4>
                  <p className="text-xs text-muted-foreground space-y-1">
                    {targetDir?.contents?.length ?? homeTotalItems} item(s)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={moveFileSpaceItemMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => moveFileSpaceItemMutation.mutate()}
            disabled={moveFileSpaceItemMutation.isPending}
          >
            {moveFileSpaceItemMutation.isPending ? "Pasting..." : "Paste"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
