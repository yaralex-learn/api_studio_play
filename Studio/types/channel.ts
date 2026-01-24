import { IChannelOutline } from "./channel-outline";

export interface INewChannel {
  id: string;
  name: string;
  description: string;
  primary_language: string;
  target_language: string;
  avatar_file_id: string;
  cover_image_file_id: string;
  published: boolean;
  channel_link: string;
}

export interface IChannelItem {
  id: string;
  name: string;
  channel_id: string;
  description: string;
  section_count: number;
  unit_count: number;
  lesson_count: number;
  quiz_count: number;
  enrolled_students: number;
  last_updated: string;
  activity_count: number;
  primary_language: string;
  published: boolean;
  target_language: string;
  avatar_file_id: string;
  cover_image_file_id: string;
}

export interface IChannelInfo {
  user_id: string;
  name: string;
  channel_id: string;
  description: string;
  section_count: number;
  unit_count: number;
  lesson_count: number;
  quiz_count: number;
  total_lesson_quiz_count: number;
  enrolled_students: number;
  last_updated: string;
  outline_content: IChannelOutline;
  _id: string;
  published: boolean;
}
