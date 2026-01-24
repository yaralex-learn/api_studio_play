import { IChannelCoupon } from "@/types/channel-coupon";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import CouponItem from "./coupon-item";

type TAddNewCouponButtonProps = {
  channelId: string;
  onSaved?: (coupon: IChannelCoupon) => void;
};

export default function AddNewCouponButton({
  channelId,
  onSaved,
}: TAddNewCouponButtonProps) {
  const [isItemDisplay, setIsItemDisplay] = useState(false);

  if (isItemDisplay) {
    return (
      <CouponItem
        channelId={channelId}
        onCancelEdit={() => setIsItemDisplay(false)}
        onSaved={(coupon) => {
          setIsItemDisplay(false);
          onSaved?.(coupon);
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
      Add New Coupon
    </Button>
  );
}
