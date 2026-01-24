import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { IChannelCoupon } from "@/types/channel-coupon";
import { useMutation } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { PropsWithChildren, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type TDuplicateCouponDialogProps = {
  channelId: string;
  coupon: IChannelCoupon;
  asChild?: boolean;
  onDuplicate?: (tier: IChannelCoupon) => void;
};

export default function DuplicateCouponDialog({
  channelId,
  coupon,
  children,
  asChild,
  onDuplicate,
}: PropsWithChildren<TDuplicateCouponDialogProps>) {
  const { refreshToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const duplicateCouponMutation = useMutation({
    mutationKey: ["duplicateCouponMutation", { id: coupon.id }],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.post(
        `/studio/channel/setting/${channelId}/coupon/`,
        {
          ...coupon,
          name: `${coupon.code} [DUPLICATED]`,
        }
      );

      return res.data;
    },
    onSuccess: (newCoupon) => {
      Toast.s({
        title: "The coupon duplicated!",
        description: "The coupon duplicated successfully.",
      });
      setIsOpen(false);
      onDuplicate?.(newCoupon);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-blue-500" />
            Duplicate Coupon
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-3">
          Are you sure you want to delete "{coupon.code}" coupon? You can remove
          the duplicated item later.
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={duplicateCouponMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => duplicateCouponMutation.mutate()}
            disabled={duplicateCouponMutation.isPending}
          >
            {duplicateCouponMutation.isPending ? "Duplicating..." : "Duplicate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
