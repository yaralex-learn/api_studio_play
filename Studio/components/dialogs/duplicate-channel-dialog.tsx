"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { IChannelItem } from "@/types/channel";
import { useMutation } from "@tanstack/react-query";
import { Copy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface DuplicateChannelDialogProps {
  channelId: string;
  channelTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DuplicateChannelDialog({
  channelId,
  channelTitle,
  isOpen,
  onClose,
}: DuplicateChannelDialogProps) {
  const router = useRouter();
  const { refreshToken } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);

  const duplicateChannelMutation = useMutation({
    mutationKey: ["duplicateChannelMutation", { channelId }],
    mutationFn: async () => {
      await refreshToken();
      const res = await Api.post<IChannelItem>(
        `/studio/channel/setting/${channelId}/duplicate/`
      );
      return res.data;
    },
    onSuccess: (newChannel) => {
      Toast.s({
        title: "You're channel duplicated successfully!",
        description: "Redirecting to channel page...",
      });

      router.replace(`/channels/${newChannel.id}/content`);
    },
  });

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold">Duplicate Channel</h3>
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
              Are you sure you want to duplicate{" "}
              <span className="font-medium">"{channelTitle}"</span>? This will
              create a copy with the same content structure, but student data
              and enrollments will not be copied.
            </p>
            <div>
              <h5 className="font-medium mb-2">What will be duplicated:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>All sections, units, activities, lessons, and quizzes</li>
                <li>Channel settings and subscription tiers</li>
                <li>The new channel will be created as a draft</li>
                <li>
                  You will be redirected to the new channel after duplication
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              disabled={duplicateChannelMutation.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              onClick={() => duplicateChannelMutation.mutate()}
              disabled={duplicateChannelMutation.isPending}
            >
              {duplicateChannelMutation.isPending
                ? "Duplicating..."
                : "Duplicate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
