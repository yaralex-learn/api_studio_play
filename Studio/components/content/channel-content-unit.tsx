"use client";

import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import useReviseText from "@/hooks/use-revise-text";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { useChannelOutline } from "@/providers/channel-outline-provider";
import { useChannel } from "@/providers/channel-provider";
import {
  IChannelUnitOutline,
  ISelectedChannelContentItemAncestors,
} from "@/types/channel-outline";
import toFileUrl from "@/utils/to-file-url";
import { useMutation } from "@tanstack/react-query";
import { ImageIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import FileSpaceManagerModal from "../file-space-manager/file-space-manager-modal";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import ChannelContentHeader from "./channel-content-header";
import { NetworkImage } from "./network-image";

type TChannelUnitContentProps = {
  unit: IChannelUnitOutline;
  indexSequence: number[];
  ancestors?: ISelectedChannelContentItemAncestors;
};

export default function ChannelUnitContent({
  unit,
  indexSequence,
  ancestors,
}: TChannelUnitContentProps) {
  const { refreshToken } = useAuth();
  const { channel } = useChannel();
  const { outlineModifier } = useChannelOutline();
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const { reviseTextMutation } = useReviseText({
    type: "unit",
    onResponse: (d) => setFormData((prev) => ({ ...prev, description: d })),
  });
  const [formData, setFormData] = useState({
    unit_outline_id: "",
    name: "",
    description: "",
    file_id: "",
  });

  useEffect(() => {
    setFormData({
      unit_outline_id: unit.id,
      name: unit.name ?? "",
      description: unit.description ?? "",
      file_id: unit.file_id ?? "",
    });
  }, [unit]);

  const saveUnitContentMutation = useMutation({
    mutationKey: ["saveUnitContentMutation", { id: unit.id }],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.post(
        `/studio/channel/content/${channel.channel_id}/units/`,
        formData
      );
      return res.data;
    },
    onSuccess: (data) => {
      outlineModifier.update.unit({
        id: unit.id,
        sectionId: ancestors?.sectionId ?? "UNKNOWN",
        data,
      });

      Toast.s({
        title: "Changes applied!",
        description: "Your changes saved successfully!",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <ChannelContentHeader
        type="Unit"
        name={unit.name}
        indexSequence={indexSequence}
        isSaving={saveUnitContentMutation.isPending}
        onSave={() => saveUnitContentMutation.mutate()}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Unit Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter section name"
            type="text"
            disabled={saveUnitContentMutation.isPending}
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="block font-medium">Unit Image</Label>
          <div className="flex items-center gap-2">
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden mr-2">
              {formData.file_id ? (
                <NetworkImage
                  className="w-full h-full object-cover"
                  src={toFileUrl(formData.file_id)}
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-neutral-500" />
              )}
            </div>

            {formData.file_id && (
              <Button
                variant="outline"
                size="icon"
                disabled={saveUnitContentMutation.isPending}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, file_id: "" }))
                }
              >
                <Trash2Icon className="h-4 w-4 text-red-500" />
              </Button>
            )}

            <Button
              variant="outline"
              disabled={saveUnitContentMutation.isPending}
              onClick={() => setFileManagerOpen(true)}
            >
              <ImageIcon className="h-4 w-4 " />
              {formData.file_id ? "Change" : "Select"} Image
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Unit Description</Label>
          <RichTextEditor
            content={formData.description}
            placeholder="Write a description for this section..."
            aiMutation={reviseTextMutation}
            onChange={(d) =>
              setFormData((prev) => ({ ...prev, description: d }))
            }
          />
        </div>
      </div>

      {/* File Space Manager Modal */}
      <FileSpaceManagerModal
        open={fileManagerOpen}
        onOpenChange={setFileManagerOpen}
        selectionFileType="image"
        onFileSelected={(file) =>
          setFormData((prev) => ({ ...prev, file_id: file.id }))
        }
      />
    </>
  );
}
