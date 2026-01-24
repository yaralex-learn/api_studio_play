import { IChannelSubscriptionTier } from "@/types/channel-subscription";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import SubscriptionTierItem from "./subscription-tier-item";

type TAddNewSubscriptionTierButtonProps = {
  channelId: string;
  onSaved?: (tier: IChannelSubscriptionTier) => void;
};

export default function AddNewSubscriptionTierButton({
  channelId,
  onSaved,
}: TAddNewSubscriptionTierButtonProps) {
  const [isItemDisplay, setIsItemDisplay] = useState(false);

  if (isItemDisplay) {
    return (
      <SubscriptionTierItem
        channelId={channelId}
        onCancelEdit={() => setIsItemDisplay(false)}
        onSaved={(tier) => {
          setIsItemDisplay(false);
          onSaved?.(tier);
        }}
      />
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full py-6 border-dashed flex items-center justify-center"
      onClick={() => setIsItemDisplay(true)}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add New Tier
    </Button>
  );
}
