export type TChannelCouponType = "Percentage" | "fixed Amount";

export interface IChannelCoupon {
  id: string;
  channel_id: string;
  code: string;
  discount_type: TChannelCouponType;
  discount_value: number;
  max_uses: number;
  expires_at?: string | null;
  is_active: boolean;
}
