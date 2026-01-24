export type TChannelQuizContentType =
  | "multiple_choice"
  | "fill_in_the_blank"
  | "true_false"
  | "matching"
  | "short_answer";

export const ChannelQuizTemplateID = {
  MULTIPLE_CHOICE: 1,
  FILL_IN_THE_BLANK: 2,
  TRUE_FALSE: 3,
  MATCHING: 4,
  SHORT_ANSWER: 5,
  LESSON_MULTIPLE_CHOICE: 6,
} as const;

export type TChannelQuizQuestionDifficulty =
  | "easy"
  | "intermediate" // DEFAULT
  | "hard";

export interface IChannelQuizContentItemTemplate {
  type: TChannelQuizContentType;
  question: string;
  answer?: string | null;
  options?: {
    id: string;
    value: string;
    pair?: string | null;
  }[];
}

export interface IChannelQuizTemplate {
  id: number;
  type: TChannelQuizContentType;
  question: string;
}

export interface IChannelQuizMultipleChoiceTemplate
  extends IChannelQuizTemplate {
  options: string[];
  correct_answer: string;
}

export interface IChannelQuizFillInBlankTemplate extends IChannelQuizTemplate {
  blanks: string[];
  options: string[][];
}

export interface IChannelQuizMatchingTemplate extends IChannelQuizTemplate {
  options: string[];
  pairs: string[];
}

export interface IChannelQuizTrueFalseTemplate extends IChannelQuizTemplate {
  correct_answer: boolean;
}

export interface IChannelQuizShortAnswerTemplate extends IChannelQuizTemplate {
  correct_answer: string;
}

export interface IChannelQuizContentItem<
  T extends IChannelQuizTemplate = IChannelQuizTemplate
> {
  id: string;
  order: number;
  quiz_outline_id?: string | null;
  time_limit?: number | null;
  points?: number | null;
  template: T;
  file_id?: string | null;
  is_accepted?: boolean | null;
  /** Only available for new created items */
  _new?: boolean | null;
  /** Only use for client-side purposes */
  _editing?: boolean | null;
}

export interface IChannelAiGeneratedQuiz<
  T extends IChannelQuizTemplate = IChannelQuizTemplate
> {
  success: boolean;
  template_id: number;
  difficulty: TChannelQuizQuestionDifficulty;
  initial_prompt: string;
  num_questions: number;
  questions: T[];
}
