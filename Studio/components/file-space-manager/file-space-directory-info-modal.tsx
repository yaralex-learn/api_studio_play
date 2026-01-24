"use client";

import Api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { QUERY_GET_FILE_SPACE_INFO_KEY } from "@/lib/constants";
import Toast from "@/lib/toast";
import { IFileItem } from "@/types/file-space";
import { FolderClosedIcon } from "lucide-react";

interface FileSpaceEditDirectoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directory?: IFileItem | null;
  parentId?: string | null;
}

export function FileSpaceEditDirectoryModal({
  open,
  onOpenChange,
  directory,
  parentId,
}: FileSpaceEditDirectoryModalProps) {
  const { refreshToken } = useAuth();
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && directory) {
      setName(directory.name);
    } else {
      setName("");
    }
  }, [open, directory]);

  const saveDirectoryMutation = useMutation({
    mutationKey: [
      "saveDirectoryMutation",
      { id: directory?.id ?? "new-directory" },
    ],
    mutationFn: async () => {
      await refreshToken();

      let res;
      if (directory) {
        res = await Api.put(`/studio/space/dir/${directory.id}/`, { name });
      } else {
        res = await Api.post(`/studio/space/dir/`, {
          name,
          parent_id: parentId,
        });
      }

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_GET_FILE_SPACE_INFO_KEY,
      });

      const action = directory ? "updated" : "created";
      Toast.s({
        title: `Folder ${action}!`,
        description: `The ${name} folder ${action} successfully!`,
      });

      onOpenChange(false);
      setName("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderClosedIcon className="h-5 w-5 text-amber-500" />
            {directory ? "Rename Folder" : "Create New Folder"}
          </DialogTitle>
          <DialogDescription>
            {directory
              ? "Enter a new name for this folder."
              : "Enter a name for your new folder."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pb-3">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              disabled={saveDirectoryMutation.isPending}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saveDirectoryMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            disabled={saveDirectoryMutation.isPending || !name.trim()}
            onClick={() => saveDirectoryMutation.mutate()}
          >
            {saveDirectoryMutation.isPending ? (
              <>{directory ? "Updating..." : "Creating..."}</>
            ) : (
              <>{directory ? "Update Folder" : "Create Folder"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
