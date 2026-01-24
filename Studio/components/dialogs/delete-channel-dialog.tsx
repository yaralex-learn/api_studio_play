"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DeleteChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRemoved?: () => void;
  channelTitle: string;
  channelId: string;
}

export function DeleteChannelDialog({
  isOpen,
  onClose,
  onRemoved,
  channelTitle,
  channelId,
}: DeleteChannelDialogProps) {
  const { refreshToken } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);

  const removeChannelMutation = useMutation({
    mutationKey: ["removeChannelMutation", { channelId }],
    mutationFn: async () => {
      await refreshToken();
      const res = await Api.delete(
        `/studio/channel/setting/${channelId}/info/`
      );
      return res.data;
    },
    onSuccess: () => {
      Toast.s({
        title: "The channel removed!",
        description: "You're channel removed successfully.",
      });

      onRemoved?.();
    },
  });

  // Reset confirm text when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmText("");
      setIsConfirmEnabled(false);
    }
  }, [isOpen]);

  // Check if confirm text matches channel title
  useEffect(() => {
    setIsConfirmEnabled(confirmText === channelTitle);
  }, [confirmText, channelTitle]);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleConfirmTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmText(e.target.value);
  };

  // Function to join class names conditionally
  const classNames = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(" ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Delete Channel
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6 space-y-4">
            <p>
              Are you sure you want to delete{" "}
              <span className="font-medium">"{channelTitle}"</span>? This action
              cannot be undone and all content, student data, and enrollments
              will be permanently lost.
            </p>
            <div>
              <h5 className="font-medium mb-2 text-red-600 dark:text-red-400">
                What will be deleted:
              </h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>
                  All content including sections, units, activities, lessons,
                  and quizzes
                </li>
                <li>All student enrollments and progress data</li>
                <li>
                  All revenue data and analytics associated with this channel
                </li>
                <li>
                  You will be redirected to the channels list after deletion
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block mb-2 font-medium">
                Type <span className="font-bold">"{channelTitle}"</span> to
                confirm deletion:
              </label>
              <Input
                type="text"
                value={confirmText}
                onChange={handleConfirmTextChange}
                placeholder="Enter channel title here"
                className={classNames(
                  "w-full",
                  confirmText && confirmText !== channelTitle
                    ? "border-red-500 focus-visible:ring-red-500"
                    : confirmText === channelTitle
                    ? "border-green-500 focus-visible:ring-green-500"
                    : ""
                )}
              />
              {confirmText && confirmText !== channelTitle && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  The text doesn't match the channel title
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              disabled={removeChannelMutation.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={() => removeChannelMutation.mutate()}
              disabled={!isConfirmEnabled || removeChannelMutation.isPending}
              className={
                !isConfirmEnabled ? "opacity-50 cursor-not-allowed" : ""
              }
            >
              {removeChannelMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
