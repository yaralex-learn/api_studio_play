import { TChannelQuizQuestionDifficulty } from "./channel-content-quiz";

export type TChannelLessonContentType =
  | "text"
  | "image-text"
  | "video-text"
  | "audio-text"
  | "multiple-choice";

export interface ILessonContentQuestion {
  question: string;
  points?: number | null;
  time_limit?: number | null;
  options: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
}

export interface IChannelLessonContentItem {
  id: string;
  lesson_outline_id?: string | null;
  lesson_type: TChannelLessonContentType;
  text?: string | null;
  file_ids?: string[] | null;
  question_lesson?: ILessonContentQuestion | null;
  order: number;
  is_launched?: boolean | null;
  is_free?: boolean | null;
  /** Only available for new created items */
  _new?: boolean | null;
}

export interface IChannelAiGeneratedLessonQuestion {
  success: boolean;
  template_id: number;
  difficulty: TChannelQuizQuestionDifficulty;
  initial_prompt: string;
  num_questions: number;
  questions: ILessonContentQuestion[];
}
