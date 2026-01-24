import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import { IReviseTextResponse, TReviseTextType } from "@/types/revise-text";
import { useMutation } from "@tanstack/react-query";

type TUseReviseTextArgs = {
  type: TReviseTextType;
  onResponse: (text: string) => void;
};

export default function useReviseText({
  type,
  onResponse,
}: TUseReviseTextArgs) {
  const { refreshToken } = useAuth();

  const reviseTextMutation = useMutation({
    mutationKey: ["reviseTextMutation", { type }],
    mutationFn: async (prompt: string) => {
      await refreshToken();

      const res = await Api.post<IReviseTextResponse>(
        "/studio/channel/generate_prompt/",
        {
          text: prompt,
          module_type: type,
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      onResponse(data.revised_text);
    },
  });

  return { reviseTextMutation };
}
