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
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { formatDate } from "@/lib/utils";
import { IChannelCoupon, TChannelCouponType } from "@/types/channel-coupon";
import { useMutation } from "@tanstack/react-query";
import { Check, Copy, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { DateTimePicker } from "../ui/date-time-picker";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";
import DeleteCouponDialog from "./coupon-delete-dialog";
import DuplicateCouponDialog from "./coupon-duplicate-dialog";

type TCouponItemProps = {
  channelId: string;
  coupon?: IChannelCoupon | null;
  onSaved?: (coupon: IChannelCoupon) => void;
  onDuplicate?: (coupon: IChannelCoupon) => void;
  onDelete?: () => void;
  onCancelEdit?: () => void;
};

export default function CouponItem({
  channelId,
  coupon,
  onSaved,
  onDuplicate,
  onDelete,
  onCancelEdit,
}: TCouponItemProps) {
  const { refreshToken } = useAuth();
  const isNew = coupon == null;
  const [isEditing, setIsEditing] = useState(isNew ? true : false);
  const [formData, setFormData] = useState<IChannelCoupon>(
    coupon ?? {
      id: "new-coupon",
      channel_id: channelId,
      code: "",
      discount_type: "Percentage",
      discount_value: 0,
      max_uses: 0,
      is_active: true,
    }
  );

  const saveCouponMutation = useMutation({
    mutationKey: ["saveCouponMutation", { id: formData.id }],
    mutationFn: async () => {
      await refreshToken();

      let res;
      if (isNew) {
        res = await Api.post<IChannelCoupon>(
          `/studio/channel/setting/${channelId}/coupon/`,
          formData
        );
      } else {
        res = await Api.put<IChannelCoupon>(
          `/studio/channel/setting/${channelId}/coupon/${formData.id}/`,
          formData
        );
      }

      return res.data;
    },
    onSuccess: (data) => {
      const state = isNew ? "added" : "updated";
      Toast.s({
        title: `The coupon ${state}!`,
        description: `The coupon ${state} successfully.`,
      });
      setIsEditing(false);
      onSaved?.(data);
    },
  });

  const toggleCouponStatusMutation = useMutation({
    mutationKey: [
      "toggleCouponStatusMutation",
      { id: coupon?.id ?? "new-coupon" },
    ],
    mutationFn: async () => {
      await refreshToken();
      const res = await Api.put<IChannelCoupon>(
        `/studio/channel/setting/${channelId}/coupon/${formData.id}/`,
        { is_active: !formData.is_active }
      );
      return res.data;
    },
    onSuccess: (data) => {
      const status = data.is_active ? "activated" : "deactivated";
      Toast.s({
        title: `The coupon ${status}!`,
        description: `The coupon ${status} successfully.`,
      });
      onSaved?.(data);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className={`border rounded-lg p-4 bg-card ${
        isEditing ? "border-primary" : ""
      }`}
    >
      {isEditing ? (
        // Editing mode
        <div>
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-medium mb-2">
              {isNew ? "Creating New Coupon" : "Editing Coupon"}
            </h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => saveCouponMutation.mutate()}
                disabled={saveCouponMutation.isPending}
                className="h-8 w-8"
              >
                {saveCouponMutation.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditing(false);
                  onCancelEdit?.();
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {/* Code */}
            <div className="space-y-1">
              <Label htmlFor="code" className="text-sm font-medium">
                Code
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <Label htmlFor="discount_type" className="font-medium">
                Type
              </Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value: TChannelCouponType) =>
                  setFormData((pv) => ({ ...pv, discount_type: value }))
                }
              >
                <SelectTrigger id="discount_type">
                  <SelectValue placeholder="Select coupon type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed Amount">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value */}
            <div className="space-y-1">
              <Label htmlFor="discount_value" className="text-sm font-medium">
                {formData.discount_type === "Percentage"
                  ? "Percentage"
                  : "Amount"}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="discount_value"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  className="pl-8"
                  placeholder="e.g., 9.99"
                />
              </div>
            </div>

            {/* Max Uses */}
            <div className="space-y-1">
              <Label htmlFor="max_uses" className="text-sm font-medium">
                Usage Limit
              </Label>
              <div className="relative">
                <Input
                  id="max_uses"
                  name="max_uses"
                  value={formData.max_uses}
                  onChange={handleInputChange}
                  placeholder="e.g., 99"
                />
              </div>
            </div>

            {/* Expires At */}
            <div className="space-y-1">
              <Label htmlFor="expires_at" className="text-sm font-medium">
                Expiration Date & Time
              </Label>
              <DateTimePicker
                id="expires_at"
                className="w-full"
                date={
                  formData.expires_at
                    ? new Date(formData.expires_at)
                    : undefined
                }
                onSelect={(date) =>
                  setFormData((pv) => ({
                    ...pv,
                    expires_at: date?.toISOString(),
                  }))
                }
              />
            </div>

            {/* Is Active */}
            <div className="space-y-1">
              <Label htmlFor="is_active" className="font-medium">
                Status
              </Label>
              <Select
                value={formData.is_active ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData((pv) => ({
                    ...pv,
                    is_active: value === "true",
                  }))
                }
              >
                <SelectTrigger id="is_active">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : (
        // Display mode
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-lg">{formData.code}</h4>
              <div className="flex items-center">
                <Switch
                  checked={formData.is_active}
                  disabled={isNew || toggleCouponStatusMutation.isPending}
                  onCheckedChange={() => {
                    if (!isNew) {
                      toggleCouponStatusMutation.mutate();
                    }
                  }}
                  className="mr-2"
                />
                <span
                  className={`flex flex-row items-center gap-2 text-xs px-2 py-1 rounded-full ${
                    formData.is_active
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {toggleCouponStatusMutation.isPending ? (
                    <Spinner className="h-4 w-4" />
                  ) : null}{" "}
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {formData.discount_type === "Percentage"
                ? `${formData.discount_value}% off`
                : `$${formData.discount_value} off`}

              {" ⌾ "}
              <span>Limit: {formData.max_uses} uses</span>

              {formData.expires_at && (
                <>
                  {" ⌾ "}
                  <span>Expires: {formatDate(formData.expires_at)}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={toggleCouponStatusMutation.isPending}
              onClick={() => setIsEditing(true)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <DuplicateCouponDialog
              channelId={channelId}
              coupon={formData}
              onDuplicate={onDuplicate}
              asChild
            >
              <Button
                variant="ghost"
                size="icon"
                disabled={toggleCouponStatusMutation.isPending}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </DuplicateCouponDialog>

            <DeleteCouponDialog
              channelId={channelId}
              couponId={formData.id}
              onDelete={onDelete}
              asChild
            >
              <Button
                variant="ghost"
                size="icon"
                disabled={toggleCouponStatusMutation.isPending}
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteCouponDialog>
          </div>
        </div>
      )}
    </div>
  );
}
