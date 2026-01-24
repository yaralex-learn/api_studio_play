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

type TDeleteSubscriptionTierDialogProps = {
  channelId: string;
  tierId: string;
  asChild?: boolean;
  onDelete?: () => void;
};

export default function DeleteSubscriptionTierDialog({
  channelId,
  tierId,
  children,
  asChild,
  onDelete,
}: PropsWithChildren<TDeleteSubscriptionTierDialogProps>) {
  const { refreshToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const deleteSubscriptionTierMutation = useMutation({
    mutationKey: ["deleteSubscriptionTierMutation", { id: tierId }],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.delete(
        `/studio/channel/setting/${channelId}/tier/${tierId}/`
      );

      return res.data;
    },
    onSuccess: () => {
      Toast.s({
        title: "The tier deleted!",
        description: "The subscription tier deleted successfully.",
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
            Delete Subscription Tier
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-3">
          Are you sure you want to delete this subscription tier? This action
          cannot be undone.
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={deleteSubscriptionTierMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteSubscriptionTierMutation.mutate()}
            disabled={deleteSubscriptionTierMutation.isPending}
          >
            {deleteSubscriptionTierMutation.isPending
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
