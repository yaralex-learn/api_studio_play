export type TSubscriptionTierBillingCycle =
  | "Monthly"
  | "Quarterly"
  | "Annually"
  | "Lifetime";

export interface IChannelSubscriptionTier {
  channel_id: string;
  name: string;
  price: number;
  capacity: number;
  billing_cycle: TSubscriptionTierBillingCycle;
  features: string[];
  id: string;
}
