"use client";

import { DeleteChannelDialog } from "@/components/dialogs/delete-channel-dialog";
import { DuplicateChannelDialog } from "@/components/dialogs/duplicate-channel-dialog";
import { useChannel } from "@/providers/channel-provider";
import { Copy, Share2, Trash2, TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ShareChannelDialog from "../dialogs/share-channel-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function ChannelManagementSection() {
  const router = useRouter();
  const { channel, CHANNEL_URL } = useChannel();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Channel Management</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your channel with options to share, duplicate or delete it
        </p>
      </div>

      {/* URL field at the top */}
      <div className="flex w-full mb-4">
        <Input value={CHANNEL_URL ?? ""} readOnly className="rounded-r-none" />
        <Button
          onClick={() => setShowShareDialog(true)}
          variant="secondary"
          className="rounded-l-none"
          disabled={!CHANNEL_URL}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      <div className="flex flex-row items-center gap-2 mb-2">
        <TriangleAlertIcon className="h-9 w-9 text-red-500" />
        <div>
          <h4 className="font-semibold text-red-500">Danger Zone</h4>
          <p className="text-sm text-muted-foreground">
            Be careful! These options cannot be reverted!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Duplicate Card */}
        <div
          className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
          onClick={() => setShowDuplicateDialog(true)}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h5 className="font-medium">Duplicate Channel</h5>
          </div>
          <p className="text-sm text-muted-foreground">
            Create an exact copy of this channel with all its content structure.
          </p>
        </div>

        {/* Delete Card */}
        <div
          className="border border-red-200 dark:border-red-900/30 rounded-lg p-4 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
          onClick={() => setShowDeleteDialog(true)}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h5 className="font-medium text-red-600 dark:text-red-400">
              Delete Channel
            </h5>
          </div>
          <p className="text-sm text-red-600/80 dark:text-red-400/80">
            Permanently delete this channel and all its content.
          </p>
        </div>
      </div>

      {/* Share Dialog */}
      {CHANNEL_URL && (
        <ShareChannelDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          channelUrl={CHANNEL_URL}
        />
      )}

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
        onRemoved={() => router.replace("/channels")}
        channelId={channel.channel_id}
        channelTitle={channel.name}
      />
    </div>
  );
}
