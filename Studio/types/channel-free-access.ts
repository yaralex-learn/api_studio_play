export interface IChannelPercentageOutlineItem {
  name: string;
  order: number;
  percentage: number;
  count: number;
}

export interface IChannelFreeAccess {
  id: string;
  channel_id: string;
  percentage: number;
  precentage_outline: Record<string, IChannelPercentageOutlineItem>;
  free_activities: string[];
}
