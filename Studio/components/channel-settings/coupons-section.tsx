"use client";

import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import { useChannel } from "@/providers/channel-provider";
import { IChannelCoupon } from "@/types/channel-coupon";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingScreen } from "../loading-screen";
import CouponItem from "./coupon-item";
import AddNewCouponButton from "./coupon-new-button";

const GET_COUPONS_QUERY_KEY = ["getCouponsQuery"] as const;

export function CouponsSection() {
  const { refreshToken } = useAuth();
  const { channel } = useChannel();
  const queryClient = useQueryClient();

  const getCouponsQuery = useQuery({
    queryKey: GET_COUPONS_QUERY_KEY,
    queryFn: async () => {
      await refreshToken();
      const res = await Api.get<IChannelCoupon[]>(
        `/studio/channel/setting/${channel.channel_id}/coupon/`
      );
      return res.data;
    },
  });

  function handleSavingItem({
    coupon,
    action,
    index,
  }: {
    coupon?: IChannelCoupon;
    action: "DELETE" | "UPDATE" | "INSERT";
    index?: number;
  }) {
    queryClient.setQueryData<IChannelCoupon[]>(
      GET_COUPONS_QUERY_KEY,
      (oldData) => {
        const _tempCoupons = [...(oldData ?? [])];
        switch (action) {
          case "INSERT":
            if (coupon) _tempCoupons.push(coupon);
            break;

          case "UPDATE":
            if (coupon && index != null) _tempCoupons[index] = coupon;
            break;

          case "DELETE":
            if (index != null) _tempCoupons.splice(index, 1);
            break;
        }
        return _tempCoupons;
      }
    );
  }

  if (
    getCouponsQuery.isLoading ||
    getCouponsQuery.isFetching ||
    !getCouponsQuery.data
  ) {
    return <LoadingScreen className="w-full min-h-0 h-[63dvh]" />;
  }

  return (
    <div className="space-y-4">
      <h3 className="w-full text-xl font-semibold mb-2">Coupons</h3>

      {/* List of coupon */}
      <div className="space-y-4">
        {getCouponsQuery.data.map((coupon, index) => (
          <CouponItem
            key={coupon.id}
            channelId={channel.channel_id}
            coupon={coupon}
            onDelete={() => handleSavingItem({ action: "DELETE", index })}
            onDuplicate={(couponData) =>
              handleSavingItem({ action: "INSERT", coupon: couponData })
            }
            onSaved={(couponData) =>
              handleSavingItem({ action: "UPDATE", coupon: couponData, index })
            }
          />
        ))}

        <AddNewCouponButton
          channelId={channel.channel_id}
          onSaved={(coupon) => handleSavingItem({ action: "INSERT", coupon })}
        />
      </div>
    </div>
  );
}
