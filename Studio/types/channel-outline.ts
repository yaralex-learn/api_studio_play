import { IChannelLessonContentItem } from "./channel-content-lesson";
import { IChannelQuizContentItem } from "./channel-content-quiz";

export interface IChannelContentOutline {
  id: string;
  name: string;
  order: number;
  count: number;
  type: "lesson" | "quiz";
  is_launched: boolean;
  is_free: boolean;
  content: Array<IChannelLessonContentItem | IChannelQuizContentItem>;
}

export interface IChannelActivityOutline {
  id: string;
  name: string;
  order: number;
  count: number;
  content: IChannelContentOutline[];
  description: string | null;
  file_id: string | null;
  difficulty_level: number | null;
  is_launched: boolean;
  /** Only available in Settings > Free Access */
  _percentage?: number;
}

export interface IChannelUnitOutline {
  id: string;
  name: string;
  order: number;
  activities: IChannelActivityOutline[];
  description: string | null;
  file_id: string | null;
  /** Only available in Settings > Free Access */
  _percentage?: number;
}

export interface IChannelSectionOutline {
  id: string;
  name: string;
  order: number;
  units: IChannelUnitOutline[];
  description: string | null;
  file_id: string | null;
  /** Only available in Settings > Free Access */
  _percentage?: number;
}

export interface IChannelOutline {
  sections: IChannelSectionOutline[];
}

export type TChannelOutlineItemIconProps = {
  expanded?: boolean;
  loading?: boolean;
};

export type TChannelContentItemType =
  | "section"
  | "unit"
  | "activity"
  | "lesson"
  | "quiz";

export type TChannelContentItem =
  | IChannelSectionOutline
  | IChannelUnitOutline
  | IChannelActivityOutline
  | IChannelContentOutline;

export interface ISelectedChannelContentItemAncestors {
  sectionId?: string;
  unitId?: string;
  activityId?: string;
}
export interface ISelectedChannelContentItem {
  type: TChannelContentItemType;
  data: TChannelContentItem;
  indexSequence: number[];
  ancestors?: ISelectedChannelContentItemAncestors;
}
