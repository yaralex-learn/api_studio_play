import {
  ChannelQuizTemplateID,
  TChannelQuizContentType,
} from "@/types/channel-content-quiz";

export const ChannelLessonMultiChoiceTemplate = {
  question: "",
  points: 0,
  time_limit: null,
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
};

export type TChannelQuizQuestionTemplateItem = {
  id: number;
  type: TChannelQuizContentType;
  title: string;
};

export const ChannelQuizQuestionTemplates: TChannelQuizQuestionTemplateItem[] =
  [
    {
      id: ChannelQuizTemplateID.MULTIPLE_CHOICE,
      type: "multiple_choice",
      title: "Multiple Choice",
    },
    {
      id: ChannelQuizTemplateID.FILL_IN_THE_BLANK,
      type: "fill_in_the_blank",
      title: "Fill in the Blank",
    },
    {
      id: ChannelQuizTemplateID.TRUE_FALSE,
      type: "true_false",
      title: "True/False",
    },
    { id: ChannelQuizTemplateID.MATCHING, type: "matching", title: "Matching" },
    {
      id: ChannelQuizTemplateID.SHORT_ANSWER,
      type: "short_answer",
      title: "Short Answer",
    },
  ];
