"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Api from "@/lib/axios";
import { QUERY_GET_FILE_SPACE_INFO_KEY } from "@/lib/constants";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import formatFileSize from "@/utils/format-file-size";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CircleCheckIcon,
  Loader2,
  PlayIcon,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import FileSpaceIcon from "./file-space-icon";

interface TFileSpaceUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | null;
  maxFileSize?: number; // in MB
  allowedTypes?: string[]; // file extensions
}

type TFileUploadStatus =
  | "pending"
  | "waiting"
  | "uploading"
  | "completed"
  | "invalid"
  | "error";

interface IFileUpload {
  id: string;
  file: File;
  progress: number;
  status: TFileUploadStatus;
  error?: string;
}

type TFileUploadProps = {
  file: IFileUpload;
  onStart?: (file: IFileUpload) => void;
  onRetry?: (file: IFileUpload) => void;
  onRemove?: (file: IFileUpload) => void;
};

function UploadFileItem({
  file,
  onStart,
  onRetry,
  onRemove,
}: TFileUploadProps) {
  return (
    <div className="flex items-center gap-3 p-3 pl-4 border rounded-lg">
      {file.status === "completed" ? (
        <CircleCheckIcon className="h-7 w-7 text-green-500" />
      ) : file.status === "error" ? (
        <AlertCircle className="h-7 w-7 text-red-500" />
      ) : file.status === "uploading" ? (
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      ) : (
        <FileSpaceIcon fileName={file.file.name} className="h-7 w-7" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate mb-1" title={file.file.name}>
          {file.file.name}
        </p>

        {file.status === "uploading" ? (
          <div className="h-4 flex flex-row items-center">
            <Progress value={file.progress} className="h-1" />
          </div>
        ) : file.error ? (
          <p className="text-xs text-red-500">{file.error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.file.size, "bytes")}
          </p>
        )}
      </div>

      <div className="flex flex-row items-center gap-1">
        {file.status === "pending" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-8 h-8"
            onClick={() => onStart?.(file)}
          >
            <PlayIcon className="h-4 w-4 text-green-500" />
          </Button>
        ) : file.status === "error" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-8 h-8"
            onClick={() => onRetry?.(file)}
          >
            <RotateCcw className="h-4 w-4 text-blue-500" />
          </Button>
        ) : (
          <div className="w-4 h-8" />
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-8 h-8"
          disabled={["waiting", "uploading"].includes(file.status)}
          onClick={() => onRemove?.(file)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

export function FileSpaceUploadModal({
  open,
  onOpenChange,
  parentId,
  maxFileSize = 100,
  allowedTypes = [],
}: TFileSpaceUploadModalProps) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<IFileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCount, setUploadCount] = useState(0);

  useEffect(() => {
    if (!open) {
      setFiles([]);

      if (uploadCount > 0) {
        Toast.s({
          title: `${uploadCount} file(s) uploaded successfully!`,
          description: "These files added to your file space.",
        });

        queryClient.invalidateQueries({
          queryKey: QUERY_GET_FILE_SPACE_INFO_KEY,
        });

        setUploadCount(0);
      }
    }
  }, [open]);

  function updateFileUploadItem(
    fileId: string,
    updateData: Partial<IFileUpload>
  ) {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, ...updateData } : f))
    );
  }

  const uploadMutation = useMutation({
    mutationFn: async ({ file, fileId }: { file: File; fileId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (parentId) {
        formData.append("directory_id", parentId);
      }

      const res = await Api.post("/studio/space/file/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            updateFileUploadItem(fileId, { progress, status: "uploading" });
          }
        },
      });

      return res.data;
    },
    onSuccess: (_, { fileId }) => {
      setUploadCount((pv) => ++pv);
      updateFileUploadItem(fileId, { progress: 100, status: "completed" });
    },
    onError: (error: any, { fileId }) => {
      const errorMessage = error.response?.data?.message || "Upload failed";
      updateFileUploadItem(fileId, {
        progress: 0,
        status: "error",
        error: errorMessage,
      });
    },
  });

  const importFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: IFileUpload[] = [];

      function validateFile(file: File) {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
          return `File size must be less than ${maxFileSize}MB`;
        }

        // Check file type if restrictions are set
        if (allowedTypes.length > 0) {
          const fileExtension = file.name.split(".").pop()?.toLowerCase();
          if (!fileExtension || !allowedTypes.includes(fileExtension)) {
            return `File type not allowed. Allowed types: ${allowedTypes.join(
              ", "
            )}`;
          }
        }

        return null;
      }

      fileArray.forEach((file) => {
        const invalidMessage = validateFile(file);
        validFiles.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          progress: 0,
          status: invalidMessage ? "invalid" : "pending",
          error: invalidMessage ?? undefined,
        });
      });

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [maxFileSize, allowedTypes]
  );

  async function addFileToQueue(fileUpload: IFileUpload) {
    try {
      updateFileUploadItem(fileUpload.id, { status: "waiting" });
      await uploadMutation.mutateAsync({
        file: fileUpload.file,
        fileId: fileUpload.id,
      });
    } catch (error) {
      Toast.e({
        title: "Something went wrong!",
        description: "Please check your credentials and try again.",
      });
    }
  }

  async function handleUploadAll() {
    const validFiles = files.filter((f) => f.status === "pending");

    if (validFiles.length === 0) {
      Toast.e({
        title: "There is nothing to upload!",
        description: "There is no valid files to upload.",
      });
      return;
    }

    const _uploadQueue: Array<Promise<void>> = [];

    for (const fileUpload of validFiles) {
      _uploadQueue.push(addFileToQueue(fileUpload));
    }

    await Promise.all(_uploadQueue);
  }

  const hasActiveUploads = files.some((f) => f.status === "uploading");
  const hasValidFiles = files.some((f) => f.status === "pending");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <span className="flex-1">Upload Files</span>
            <Button
              className="w-8 h-8 p-2 rounded-full"
              variant="ghost"
              size="icon"
              disabled={hasActiveUploads}
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>

          <DialogDescription className="text-xs">
            {maxFileSize && `Maximum file size: ${maxFileSize}MB`}
            <br />
            {allowedTypes.length > 0 &&
              `Allowed types: ${allowedTypes.join(", ")}.`}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "h-[14rem] flex flex-col items-center justify-center",
            "border-2 border-dashed rounded-lg transition-colors",
            isDragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : "border-gray-300 dark:border-gray-600"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const droppedFiles = e.dataTransfer.files;
            if (droppedFiles.length > 0) {
              importFiles(droppedFiles);
            }
          }}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            You can upload multiple files at once
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const selectedFiles = e.target.files;
              if (selectedFiles && selectedFiles.length > 0) {
                importFiles(selectedFiles);
              }
              e.target.value = "";
            }}
            accept={
              allowedTypes.length > 0
                ? allowedTypes.map((type) => `.${type}`).join(",")
                : undefined
            }
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold">
                Files to Upload ({files.length})
              </h4>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 text-xs"
                onClick={handleUploadAll}
                disabled={!hasValidFiles}
              >
                Upload All
              </Button>
            </div>

            <ScrollArea className="h-[24dvh]">
              <div className="space-y-2 mb-3">
                {files.map((fileUpload) => (
                  <UploadFileItem
                    key={fileUpload.id}
                    file={fileUpload}
                    onStart={addFileToQueue}
                    onRetry={addFileToQueue}
                    onRemove={() =>
                      setFiles((prev) =>
                        prev.filter((f) => f.id !== fileUpload.id)
                      )
                    }
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
