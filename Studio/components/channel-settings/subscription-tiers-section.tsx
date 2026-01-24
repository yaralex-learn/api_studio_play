"use client";

import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import { useChannel } from "@/providers/channel-provider";
import { IChannelSubscriptionTier } from "@/types/channel-subscription";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingScreen } from "../loading-screen";
import SubscriptionTierItem from "./subscription-tier-item";
import AddNewSubscriptionTierButton from "./subscription-tier-new-button";

type SubscriptionPlan = {
  id: string;
  name: string;
  capacity: string;
  price: string;
  billingOption: string;
  features?: string[];
};

const GET_SUBSCRIPTION_TIERS_KEY = ["getSubscriptionTiers"] as const;

export function SubscriptionTiersSection() {
  const queryClient = useQueryClient();
  const { refreshToken } = useAuth();
  const { channel } = useChannel();

  const getSubscriptionTiers = useQuery({
    queryKey: GET_SUBSCRIPTION_TIERS_KEY,
    queryFn: async () => {
      await refreshToken();
      const res = await Api.get<IChannelSubscriptionTier[]>(
        `/studio/channel/setting/${channel.channel_id}/tier/`
      );
      return res.data;
    },
  });

  function handleSavingItem({
    tier,
    action,
    index,
  }: {
    tier?: IChannelSubscriptionTier;
    action: "DELETE" | "UPDATE" | "INSERT";
    index?: number;
  }) {
    queryClient.setQueryData<IChannelSubscriptionTier[]>(
      GET_SUBSCRIPTION_TIERS_KEY,
      (oldData) => {
        const _tempTiers = [...(oldData ?? [])];
        switch (action) {
          case "INSERT":
            if (tier) _tempTiers.push(tier);
            break;

          case "UPDATE":
            if (tier && index != null) _tempTiers[index] = tier;
            break;

          case "DELETE":
            if (index != null) _tempTiers.splice(index, 1);
            break;
        }
        return _tempTiers;
      }
    );
  }

  if (
    getSubscriptionTiers.isLoading ||
    getSubscriptionTiers.isFetching ||
    !getSubscriptionTiers.data
  ) {
    return <LoadingScreen className="w-full min-h-0 h-[63dvh]" />;
  }

  return (
    <div className="space-y-6">
      <h3 className="w-full text-xl font-semibold mb-2">Subscription Tiers</h3>

      {/* List of subscription plans */}
      <div className="space-y-4">
        {getSubscriptionTiers.data.map((tier, index) => (
          <SubscriptionTierItem
            key={tier.id}
            channelId={channel.channel_id}
            subscriptionTier={tier}
            onDelete={() => handleSavingItem({ action: "DELETE", index })}
            onDuplicate={(tierData) =>
              handleSavingItem({ action: "INSERT", tier: tierData })
            }
            onSaved={(tierData) =>
              handleSavingItem({ action: "UPDATE", tier: tierData, index })
            }
          />
        ))}

        <AddNewSubscriptionTierButton
          channelId={channel.channel_id}
          onSaved={(tier) => handleSavingItem({ action: "INSERT", tier })}
        />
      </div>
    </div>
  );
}
