"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { useChannel } from "@/providers/channel-provider";
import { IChannelItem } from "@/types/channel";
import { IFileItem } from "@/types/file-space";
import toFileUrl from "@/utils/to-file-url";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon, Save, Trash2Icon, User } from "lucide-react";
import { useEffect, useState } from "react";
import FileSpaceManagerModal from "../file-space-manager/file-space-manager-modal";
import { LoadingScreen } from "../loading-screen";

export function ChannelInformationSection() {
  const { channel } = useChannel();
  const { refreshToken } = useAuth();
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"avatar" | "cover" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    primary_language: "",
    target_language: "",
    avatar_file_id: "",
    cover_image_file_id: "",
  });

  const getChannelInfoQuery = useQuery({
    queryKey: [],
    queryFn: async () => {
      await refreshToken();
      const res = await Api.get<IChannelItem>(
        `/studio/channel/${channel.channel_id}/`
      );
      return res.data;
    },
  });

  useEffect(() => {
    const channelInfo = getChannelInfoQuery.data;
    if (channelInfo) {
      setFormData({
        name: channelInfo.name,
        description: channelInfo.description,
        primary_language: channelInfo.primary_language,
        target_language: channelInfo.target_language,
        avatar_file_id: channelInfo.avatar_file_id,
        cover_image_file_id: channelInfo.cover_image_file_id,
      });
    }
  }, [getChannelInfoQuery.data]);

  const saveChannelInfoMutation = useMutation({
    mutationKey: ["saveChannelInfoMutation"],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.put(
        `/studio/channel/setting/${channel.channel_id}/info/`,
        formData
      );

      return res.data;
    },
    onSuccess: () => {
      Toast.s({
        title: "Data saved successfully!",
      });
    },
  });

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Function to handle opening the file manager
  const handleOpenFileManager = (type: "avatar" | "cover") => {
    setUploadType(type);
    setFileManagerOpen(true);
  };

  // Function to handle file selection from the file manager
  const handleFileSelected = (file: IFileItem) => {
    if (uploadType === "avatar") {
      setFormData((prev) => ({ ...prev, avatar_file_id: file.id }));
    } else if (uploadType === "cover") {
      setFormData((prev) => ({ ...prev, cover_image_file_id: file.id }));
    }
    setFileManagerOpen(false);
  };

  if (getChannelInfoQuery.isLoading || getChannelInfoQuery.isFetching) {
    return <LoadingScreen className="w-full min-h-0 h-[63dvh]" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">Channel Information</h3>
        <Button
          disabled={
            saveChannelInfoMutation.isPending ||
            !formData.name ||
            !formData.primary_language
          }
          onClick={() => saveChannelInfoMutation.mutate()}
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveChannelInfoMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Basic details about your learning channel
      </p>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center">
            <Label htmlFor="channel-name" className="font-medium">
              Channel Name
            </Label>
            <span className="text-red-500 ml-1">*</span>
          </div>
          <Input
            id="channel-name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={saveChannelInfoMutation.isPending}
            placeholder="Enter channel name"
          />
          <p className="text-xs text-muted-foreground">
            Choose a clear, descriptive name for your channel
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="description" className="font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            disabled={saveChannelInfoMutation.isPending}
            placeholder="Enter channel description"
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Briefly describe what learners will gain from your channel
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="primary_language" className="block font-medium">
              Primary Language
            </Label>
            <span className="text-red-500 ml-1">*</span>
          </div>
          <Select
            name="primary_language"
            value={formData.primary_language}
            disabled={saveChannelInfoMutation.isPending}
            onValueChange={(v) =>
              setFormData((pv) => ({ ...pv, primary_language: v }))
            }
            required
          >
            <SelectTrigger id="primary_language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="ru">Russian</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="fa">Persian</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_language" className="block font-medium">
            Target Language
          </Label>
          <Select
            name="target_language"
            value={formData.target_language}
            disabled={saveChannelInfoMutation.isPending}
            onValueChange={(v) =>
              setFormData((pv) => ({ ...pv, target_language: v }))
            }
          >
            <SelectTrigger id="target_language">
              <SelectValue placeholder="Select target language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="ru">Russian</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="fa">Persian</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="block font-medium">Avatar</Label>
          <div className="flex items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden mr-2">
              {formData.avatar_file_id ? (
                <img
                  className="w-full h-full object-cover"
                  src={toFileUrl(formData.avatar_file_id)}
                  alt="Avatar"
                  loading="lazy"
                  decoding="async"
                  data-nimg="1"
                />
              ) : (
                <User className="h-6 w-6 text-neutral-500" />
              )}
            </div>

            {formData.avatar_file_id && (
              <Button
                variant="outline"
                size="icon"
                disabled={saveChannelInfoMutation.isPending}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, avatar_file_id: "" }))
                }
              >
                <Trash2Icon className="h-4 w-4 text-red-500" />
              </Button>
            )}

            <Button
              variant="outline"
              disabled={saveChannelInfoMutation.isPending}
              onClick={() => handleOpenFileManager("avatar")}
            >
              <ImageIcon className="h-4 w-4 " />
              {formData.avatar_file_id ? "Change" : "Select"} Avatar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="block font-medium">Cover Image</Label>
          <div className="relative border border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center overflow-hidden">
            {formData.cover_image_file_id ? (
              <img
                className="w-full h-32 object-cover"
                src={toFileUrl(formData.cover_image_file_id)}
                alt="Avatar"
                loading="lazy"
                decoding="async"
                data-nimg="1"
              />
            ) : (
              <div className="h-32 rounded-lg flex flex-col items-center justify-center gap-2">
                <ImageIcon className="h-12 w-12 text-neutral-500" />
              </div>
            )}

            <div className="absolute top-3 right-3 flex flex-row items-center gap-2">
              {formData.cover_image_file_id && (
                <Button
                  variant="outline"
                  size="icon"
                  disabled={saveChannelInfoMutation.isPending}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      cover_image_file_id: "",
                    }))
                  }
                >
                  <Trash2Icon className="h-4 w-4 text-red-500" />
                </Button>
              )}

              <Button
                variant="outline"
                disabled={saveChannelInfoMutation.isPending}
                onClick={() => handleOpenFileManager("cover")}
              >
                <ImageIcon className="h-4 w-4" />
                {formData.cover_image_file_id ? "Change" : "Select"} Cover
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* File Space Manager Modal */}
      <FileSpaceManagerModal
        open={fileManagerOpen}
        onOpenChange={setFileManagerOpen}
        onFileSelected={handleFileSelected}
        selectionFileType="image"
      />
    </div>
  );
}
