import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
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

type TDeleteCouponDialogProps = {
  channelId: string;
  couponId: string;
  asChild?: boolean;
  onDelete?: () => void;
};

export default function DeleteCouponDialog({
  channelId,
  couponId,
  children,
  asChild,
  onDelete,
}: PropsWithChildren<TDeleteCouponDialogProps>) {
  const { refreshToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const deleteCouponMutation = useMutation({
    mutationKey: ["deleteCouponMutation", { id: couponId }],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.delete(
        `/studio/channel/setting/${channelId}/coupon/${couponId}/`
      );

      return res.data;
    },
    onSuccess: () => {
      Toast.s({
        title: "The coupon deleted!",
        description: "The coupon deleted successfully.",
      });
      setIsOpen(false);
      onDelete?.();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Coupon
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-3">
          Are you sure you want to delete this coupon? This action cannot be
          undone.
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={deleteCouponMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteCouponMutation.mutate()}
            disabled={deleteCouponMutation.isPending}
          >
            {deleteCouponMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
