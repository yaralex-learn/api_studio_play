export type TReviseTextType = "lesson" | "activity" | "unit" | "section";

export interface IReviseTextResponse {
  success: boolean;
  original_text: string;
  module_type: TReviseTextType;
  revised_text: string;
}
