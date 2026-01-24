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
import {
  IChannelSubscriptionTier,
  TSubscriptionTierBillingCycle,
} from "@/types/channel-subscription";
import { useMutation } from "@tanstack/react-query";
import { Check, Copy, Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import DeleteSubscriptionTierDialog from "./subscription-tier-delete-dialog";
import DuplicateSubscriptionTierDialog from "./subscription-tier-duplicate-dialog";

type TSubscriptionTierItemProps = {
  channelId: string;
  subscriptionTier?: IChannelSubscriptionTier | null;
  onSaved?: (tier: IChannelSubscriptionTier) => void;
  onDuplicate?: (tier: IChannelSubscriptionTier) => void;
  onDelete?: () => void;
  onCancelEdit?: () => void;
};

export default function SubscriptionTierItem({
  channelId,
  subscriptionTier,
  onSaved,
  onDuplicate,
  onDelete,
  onCancelEdit,
}: TSubscriptionTierItemProps) {
  const { refreshToken } = useAuth();
  const isNew = subscriptionTier == null;
  const [isEditing, setIsEditing] = useState(isNew ? true : false);
  const [formData, setFormData] = useState<IChannelSubscriptionTier>(
    subscriptionTier ?? {
      channel_id: channelId,
      name: "",
      price: 0,
      capacity: 0,
      billing_cycle: "Lifetime",
      features: [],
      id: "new-subscription-tier",
    }
  );

  const saveSubscriptionTierMutation = useMutation({
    mutationKey: ["saveSubscriptionTierMutation", { id: formData.id }],
    mutationFn: async () => {
      await refreshToken();

      let res;
      if (isNew) {
        res = await Api.post<IChannelSubscriptionTier>(
          `/studio/channel/setting/${channelId}/tier/`,
          formData
        );
      } else {
        res = await Api.put<IChannelSubscriptionTier>(
          `/studio/channel/setting/${channelId}/tier/${formData.id}/`,
          formData
        );
      }

      return res.data;
    },
    onSuccess: (tier) => {
      const state = isNew ? "added" : "updated";
      Toast.s({
        title: `The tier ${state}!`,
        description: `The subscription tier ${state} successfully.`,
      });
      setIsEditing(false);
      onSaved?.(tier);
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
              {isNew
                ? "Creating New Subscription Tier"
                : "Editing Subscription Tier"}
            </h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => saveSubscriptionTierMutation.mutate()}
                disabled={saveSubscriptionTierMutation.isPending}
                className="h-8 w-8"
              >
                {saveSubscriptionTierMutation.isPending ? (
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
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-medium">
                Tier Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <Label htmlFor="price" className="text-sm font-medium">
                Price ($)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="pl-8"
                  placeholder="e.g., 9.99"
                />
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-1">
              <Label htmlFor="capacity" className="text-sm font-medium">
                Capacity
              </Label>
              <div className="relative">
                <Input
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="e.g., 99"
                />
              </div>
            </div>

            {/* Billing Cycle */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Billing Cycle</Label>
              <Select
                value={formData.billing_cycle}
                onValueChange={(value: TSubscriptionTierBillingCycle) =>
                  setFormData((pv) => ({ ...pv, billing_cycle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                  <SelectItem value="Lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Features */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Features</Label>
              <div className="space-y-2">
                {formData.features?.map((feature, idx) => (
                  <div
                    key={`subscription-tier-${formData.id}-${idx}`}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const updatedFeatures = [...(formData.features || [])];
                        updatedFeatures[idx] = e.target.value;
                        setFormData((pv) => ({
                          ...pv,
                          features: updatedFeatures,
                        }));
                      }}
                      placeholder="Feature description"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updatedFeatures = [...(formData.features || [])];
                        updatedFeatures.splice(idx, 1);
                        setFormData((pv) => ({
                          ...pv,
                          features: updatedFeatures,
                        }));
                      }}
                      className="h-8 w-8 text-red-500"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updatedFeatures = [...(formData.features || []), ""];
                    setFormData((pv) => ({
                      ...pv,
                      features: updatedFeatures,
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Display mode
        <>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-medium text-lg">{formData.name}</h4>
              <p className="text-sm text-muted-foreground">
                ${formData.price}/{formData.billing_cycle}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <DuplicateSubscriptionTierDialog
                channelId={channelId}
                subscriptionTier={formData}
                onDuplicate={onDuplicate}
                asChild
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
              </DuplicateSubscriptionTierDialog>

              <DeleteSubscriptionTierDialog
                channelId={channelId}
                tierId={formData.id}
                onDelete={onDelete}
                asChild
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DeleteSubscriptionTierDialog>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Capacity:</span>{" "}
              {formData.capacity != null
                ? `${formData.capacity} subscribers`
                : "Unlimited"}
            </div>

            <div>
              <span className="font-medium">Billing:</span>{" "}
              {formData.billing_cycle}
            </div>
          </div>

          {formData.features && formData.features.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Features:</h5>
              <ul className="space-y-1">
                {formData.features.map((feature, idx) => (
                  <li key={idx} className="text-sm flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
