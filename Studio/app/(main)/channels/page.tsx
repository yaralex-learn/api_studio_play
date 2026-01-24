"use client";

import { ChannelCard } from "@/components/channel-card";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import { IChannelItem } from "@/types/channel";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function ChannelsPage() {
  const { refreshToken } = useAuth();

  const getChannelsInfiniteQuery = useInfiniteQuery({
    queryKey: ["getChannelsInfiniteQuery"],
    queryFn: async ({ pageParam = 1 }) => {
      await refreshToken();

      const res = await Api.get<IChannelItem[]>(
        `/studio/channel/all_my_channels/?page_size=12&page=${pageParam}`
      );

      const pageData = {
        data: res.data,
        pages: 1,
      };

      return {
        data: pageData.data,
        previousCursor: pageParam > 1 ? pageParam - 1 : 1,
        nextCursor: pageParam < pageData.pages ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getPreviousPageParam: (lastPage) => lastPage.previousCursor,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const channels = useMemo(() => {
    const _channels: IChannelItem[] = [];
    if (getChannelsInfiniteQuery.data) {
      for (const page of getChannelsInfiniteQuery.data.pages) {
        _channels.push(...page.data);
      }
    }
    return _channels;
  }, [getChannelsInfiniteQuery.data]);

  return (
    <div className="container flex flex-col items-stretch py-6 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Channels</h1>
        <Link href="/new-channel">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      {getChannelsInfiniteQuery.isLoading ||
      (getChannelsInfiniteQuery.isFetching &&
        getChannelsInfiniteQuery.isFetchingNextPage) ? (
        <LoadingScreen className="min-h-0 h-[66dvh]" />
      ) : channels.length === 0 ? (
        <div className="h-[50dvh] flex flex-col items-center justify-center gap-2">
          <span className="font-bold text-2xl">No channels found!</span>
          <span className="text-sm text-foreground opacity-45">
            Create new channel by clicking on the button below
          </span>

          <Link className="mt-8" href="/new-channel">
            <Button variant="secondary" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}

      {getChannelsInfiniteQuery.hasNextPage && (
        <div className="flex items-center justify-center mt-6">
          <Button
            variant="secondary"
            onClick={() => getChannelsInfiniteQuery.fetchNextPage()}
          >
            {getChannelsInfiniteQuery.isFetchingNextPage
              ? "Loading..."
              : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
