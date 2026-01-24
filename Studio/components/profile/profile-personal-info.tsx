import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { IApiResponse } from "@/types/api";
import { IAuthData } from "@/types/auth";
import toFileUrl from "@/utils/to-file-url";
import { useMutation } from "@tanstack/react-query";
import { ImageIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { NetworkImage } from "../content/network-image";
import FileSpaceManagerModal from "../file-space-manager/file-space-manager-modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export default function ProfilePersonalInfo() {
  const { user, refreshToken, updateUser } = useAuth();
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio ?? "",
        avatar_url: user.avatar_url ?? "",
      });
    }
  }, [user]);

  const saveUserInfoMutation = useMutation({
    mutationKey: ["saveUserInfoMutation", { id: user?.id }],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.patch<IApiResponse<IAuthData>>(
        "/public/auth/me/",
        formData
      );
      return res.data;
    },
    onSuccess: ({ data }) => {
      updateUser(data.user);

      Toast.s({
        title: "Data saved successfully!",
        description: "Your personal information updated.",
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
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="text-xs text-muted-foreground">
              Update your personal and public profile information.
            </p>
          </div>
          <Button onClick={() => saveUserInfoMutation.mutate()}>
            <SaveIcon className="h-4 w-4" />
            {saveUserInfoMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Avatar */}
          <div className="space-y-2">
            <Label className="block font-medium">Avatar</Label>
            <div className="flex items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden mr-2">
                {formData.avatar_url ? (
                  <NetworkImage
                    className="h-16 w-16 object-cover"
                    src={toFileUrl(formData.avatar_url)}
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-neutral-500" />
                )}
              </div>

              {formData.avatar_url && (
                <Button
                  variant="outline"
                  size="icon"
                  disabled={saveUserInfoMutation.isPending}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, file_id: "" }))
                  }
                >
                  <Trash2Icon className="h-4 w-4 text-red-500" />
                </Button>
              )}

              <Button
                variant="outline"
                disabled={saveUserInfoMutation.isPending}
                onClick={() => setFileManagerOpen(true)}
              >
                <ImageIcon className="h-4 w-4 " />
                {formData.avatar_url ? "Change" : "Select"} Avatar
              </Button>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                disabled={saveUserInfoMutation.isPending}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                disabled={saveUserInfoMutation.isPending}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* File Space Manager Modal */}
      <FileSpaceManagerModal
        open={fileManagerOpen}
        onOpenChange={setFileManagerOpen}
        selectionFileType="image"
        onFileSelected={(file) => {
          setFormData((pv) => ({ ...pv, avatar_url: file.id }));
          setFileManagerOpen(false);
        }}
      />
    </>
  );
}
