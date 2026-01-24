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
import { AlertTriangle, File, FolderClosedIcon, Loader2 } from "lucide-react";

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: IFileItem;
  onDelete?: () => void;
}

export function FileSpaceDeleteModal({
  open,
  onOpenChange,
  item,
  onDelete,
}: DeleteModalProps) {
  const { refreshToken } = useAuth();
  const queryClient = useQueryClient();
  const isDirectory = item.contents != null;

  const deleteFileSpaceItemMutation = useMutation({
    mutationKey: ["deleteFileSpaceItemMutation", { id: item.id }],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.delete(
        `/studio/space/${isDirectory ? "dir" : "file"}/${item.id}/`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_GET_FILE_SPACE_INFO_KEY,
      });

      const type = isDirectory ? "folder" : "file";
      Toast.s({
        title: `The ${type} deleted!`,
        description: `The ${type} deleted from you'r space successfully!`,
      });

      onOpenChange(false);
      onDelete?.();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Delete {isDirectory ? "Folder" : "File"}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            {isDirectory ? "folder" : "file"} from your storage.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {isDirectory ? (
                  <FolderClosedIcon className="h-8 w-8 text-amber-500 mt-1" />
                ) : (
                  <File className="h-8 w-8 text-gray-500 mt-1" />
                )}

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

          {isDirectory && (
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Warning: Folder contains files
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Deleting this folder will also delete all files and
                    subfolders inside it.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteFileSpaceItemMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteFileSpaceItemMutation.mutate()}
            disabled={deleteFileSpaceItemMutation.isPending}
          >
            {deleteFileSpaceItemMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>Delete {isDirectory ? "Folder" : "File"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
