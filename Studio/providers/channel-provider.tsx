import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import { YARALEX_PLAY_URL } from "@/lib/constants";
import { IChannelInfo } from "@/types/channel";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

export const GET_CHANNEL_QUERY_KEY = ["getChannelQuery"];

type TChannelContext = {
  channel: IChannelInfo;
  CHANNEL_URL: string | null;
  updateChannelInfo: (
    info: Partial<Omit<IChannelInfo, "outline_content">>
  ) => void;
};

type TChannelProviderProps = {
  channelID: string;
};

const ChannelContext = createContext<TChannelContext | undefined>(undefined);

export default function ChannelProvider({
  channelID,
  children,
}: PropsWithChildren<TChannelProviderProps>) {
  const { user, refreshToken } = useAuth();
  const queryClient = useQueryClient();

  const getChannelQuery = useQuery({
    queryKey: GET_CHANNEL_QUERY_KEY,
    queryFn: async () => {
      await refreshToken();
      const res = await Api.get<IChannelInfo>(`/studio/channel/${channelID}/`);
      return res.data;
    },
  });

  const CHANNEL_URL = useMemo(() => {
    return `${YARALEX_PLAY_URL}/${user?.id}/${getChannelQuery.data?.channel_id}`;
  }, [getChannelQuery.data, user]);

  function updateChannelInfo(
    data: Partial<Omit<IChannelInfo, "outline_content">>
  ) {
    queryClient.setQueryData(
      GET_CHANNEL_QUERY_KEY,
      (old: IChannelInfo | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      }
    );
  }

  if (
    getChannelQuery.isLoading ||
    getChannelQuery.isFetching ||
    !getChannelQuery.data
  ) {
    return <LoadingScreen />;
  }

  return (
    <ChannelContext.Provider
      value={{ channel: getChannelQuery.data, CHANNEL_URL, updateChannelInfo }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error("useChannel must be used within an ChannelProvider");
  }
  return context;
}
