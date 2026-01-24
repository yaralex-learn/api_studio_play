import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { IChannelSubscriptionTier } from "@/types/channel-subscription";
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

type TDuplicateSubscriptionTierDialogProps = {
  channelId: string;
  subscriptionTier: IChannelSubscriptionTier;
  asChild?: boolean;
  onDuplicate?: (tier: IChannelSubscriptionTier) => void;
};

export default function DuplicateSubscriptionTierDialog({
  channelId,
  subscriptionTier,
  children,
  asChild,
  onDuplicate,
}: PropsWithChildren<TDuplicateSubscriptionTierDialogProps>) {
  const { refreshToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const duplicateSubscriptionTierMutation = useMutation({
    mutationKey: [
      "duplicateSubscriptionTierMutation",
      { id: subscriptionTier.id },
    ],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.post(`/studio/channel/setting/${channelId}/tier/`, {
        ...subscriptionTier,
        name: `${subscriptionTier.name} [DUPLICATED]`,
      });

      return res.data;
    },
    onSuccess: (tier) => {
      Toast.s({
        title: "The tier duplicated!",
        description: "The subscription tier duplicated successfully.",
      });
      setIsOpen(false);
      onDuplicate?.(tier);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-blue-500" />
            Duplicate Subscription Tier
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-3">
          Are you sure you want to delete "{subscriptionTier.name}" subscription
          tier? You can remove the duplicated item later.
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={duplicateSubscriptionTierMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => duplicateSubscriptionTierMutation.mutate()}
            disabled={duplicateSubscriptionTierMutation.isPending}
          >
            {duplicateSubscriptionTierMutation.isPending
              ? "Duplicating..."
              : "Duplicate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
