"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useChannel } from "@/providers/channel-provider";
import { IChannelFreeAccess } from "@/types/channel-free-access";
import { IChannelActivityOutline } from "@/types/channel-outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EditIcon, Info, SaveIcon, Undo2Icon } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { LoadingScreen } from "../loading-screen";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const GET_FREE_ACCESS_INFO_QUERY_KEY = ["getFreeAccessInfoQuery"];

export function FreeAccessSection() {
  const { refreshToken } = useAuth();
  const { channel } = useChannel();
  const queryClient = useQueryClient();
  const [freePercentage, setFreePercentage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [openEditTooltip, setOpenEditTooltip] = useState(false);

  const getFreeAccessInfo = useQuery({
    queryKey: GET_FREE_ACCESS_INFO_QUERY_KEY,
    queryFn: async () => {
      await refreshToken();

      const freeAccessRes = await Api.get<IChannelFreeAccess>(
        `/studio/channel/setting/${channel.channel_id}/free-access/`
      );

      const freePercentageRes = await Api.get<IChannelFreeAccess>(
        `/studio/channel/setting/${channel.channel_id}/free-access/percentage/`
      );

      return {
        freeAccess: freeAccessRes.data,
        freePercentage: freePercentageRes.data,
      };
    },
  });

  useEffect(() => {
    if (getFreeAccessInfo.data) {
      setFreePercentage(getFreeAccessInfo.data.freeAccess.percentage);
    }
  }, [getFreeAccessInfo.data]);

  const channelOutline = useMemo(() => {
    const _sections = [...channel.outline_content.sections];
    const _activities: IChannelActivityOutline[] = [];

    if (getFreeAccessInfo.data) {
      if (isEditing) {
        const _percentages =
          getFreeAccessInfo.data.freePercentage.precentage_outline;

        let _percentageIndex = 0;
        for (const s of _sections) {
          s._percentage = 0;
          for (const u of s.units) {
            for (const a of u.activities) {
              const _percentage = _percentages[a.id]?.percentage ?? 0;
              _percentageIndex += _percentage;
              a._percentage = _percentageIndex;
              u._percentage = _percentageIndex;
              s._percentage = _percentageIndex;

              _activities.push(a);
            }
          }
        }
      } else {
        const freeActivities =
          getFreeAccessInfo.data.freeAccess.free_activities;

        for (const s of _sections) {
          let freeSectionUnits = 0;

          for (const u of s.units) {
            let freeUnitActivities = 0;

            for (const a of u.activities) {
              if (freeActivities.includes(a.id)) {
                a._percentage = -1;
                freeUnitActivities++;
              } else {
                a._percentage = 100;
              }

              _activities.push(a);
            }

            if (freeUnitActivities === u.activities.length) {
              u._percentage = -1;
              freeSectionUnits++;
            } else {
              u._percentage = 100;
            }
          }

          s._percentage = freeSectionUnits === s.units.length ? -1 : 100;
        }
      }
    }

    return { sections: _sections, allActivities: _activities };
  }, [channel, isEditing, getFreeAccessInfo.data]);

  const saveFreeAccessInfo = useMutation({
    mutationKey: [
      "saveFreeAccessInfoMutation",
      { channelId: channel.channel_id },
    ],
    mutationFn: async () => {
      await refreshToken();

      const freeActivities = channelOutline.allActivities
        .filter((a) => (a._percentage ?? 100) <= freePercentage)
        .map((a) => a.id);

      const res = await Api.put<IChannelFreeAccess>(
        `/studio/channel/setting/${channel.channel_id}/free-access/`,
        {
          channel_id: channel.channel_id,
          percentage: freePercentage,
          free_activities: freeActivities,
          precentage_outline:
            getFreeAccessInfo.data?.freePercentage.precentage_outline ?? {},
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      setIsEditing(false);

      queryClient.setQueryData(
        GET_FREE_ACCESS_INFO_QUERY_KEY,
        (
          old:
            | {
                freeAccess: IChannelFreeAccess;
                freePercentage: IChannelFreeAccess;
              }
            | undefined
        ) => {
          if (!old) return old;
          return {
            ...old,
            freeAccess: data,
          };
        }
      );

      Toast.s({
        title: "Changes applied!",
        description: "Your policy has been applied to free channel access.",
      });
    },
  });

  if (
    getFreeAccessInfo.isLoading ||
    getFreeAccessInfo.isFetching ||
    !getFreeAccessInfo.data
  ) {
    return <LoadingScreen className="w-full min-h-0 h-[63dvh]" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">Free Access</h3>

        {isEditing ? (
          <div className="flex flex-row items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={saveFreeAccessInfo.isPending}
              onClick={() => {
                setIsEditing(false);
                setFreePercentage(getFreeAccessInfo.data.freeAccess.percentage);
              }}
            >
              <Undo2Icon className="h-4 w-4" />
              Discard
            </Button>

            <Button
              size="sm"
              disabled={saveFreeAccessInfo.isPending}
              onClick={() => saveFreeAccessInfo.mutate()}
            >
              <SaveIcon className="h-4 w-4" />
              {saveFreeAccessInfo.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <Tooltip open={openEditTooltip}>
            <TooltipContent
              className="font-bold text-sm text-white bg-red-500 [&>span>svg]:fill-red-500 [&>span>svg]:bg-red-500"
              side="left"
            >
              Activate Edit Mode!
            </TooltipContent>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                disabled={saveFreeAccessInfo.isPending}
                onClick={() => {
                  setIsEditing(true);
                  setOpenEditTooltip(false);
                  setFreePercentage(
                    getFreeAccessInfo.data.freeAccess.percentage
                  );
                }}
              >
                <EditIcon className="h-4 w-4" />
                Edit
              </Button>
            </TooltipTrigger>
          </Tooltip>
        )}
      </div>

      <div className="flex items-start space-x-3 mb-2">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Offering {freePercentage}% of content for free gives learners a
          preview while encouraging subscriptions.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="font-medium">Free Content Percentage</Label>
          <span className="font-medium text-sm">{freePercentage}%</span>
        </div>

        <Slider
          value={[freePercentage]}
          onValueChange={(v) => setFreePercentage(v[0] ?? 0)}
          disabled={!isEditing || saveFreeAccessInfo.isPending}
          max={20}
          min={0}
          step={1}
          onPointerDown={() => {
            if (!isEditing) {
              setOpenEditTooltip(true);
            }
          }}
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>20%</span>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <Label className="font-medium">Content Preview</Label>

        {channelOutline.sections.map((section, sIndex) => {
          const sectionIndex = sIndex + 1;
          const isSectionFree = freePercentage >= (section._percentage ?? 0);

          return (
            <Fragment key={section.id}>
              <div className="py-1">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-purple-600/90 mr-2" />
                  <span
                    className={cn(
                      "font-medium",
                      isSectionFree ? "text-blue-400" : "text-muted-foreground"
                    )}
                  >
                    Section {sectionIndex}: {section.name}
                  </span>

                  {isSectionFree && (
                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      Free
                    </span>
                  )}
                </div>
              </div>

              {section.units.map((unit, uIndex) => {
                const unitIndex = uIndex + 1;
                const isUnitFree = freePercentage >= (unit._percentage ?? 0);

                return (
                  <Fragment key={unit.id}>
                    <div className="py-1 pl-6">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-600/90 mr-2" />
                        <span
                          className={cn(
                            "text-sm",
                            isUnitFree
                              ? "text-blue-400"
                              : "text-muted-foreground"
                          )}
                        >
                          Unit {sectionIndex}.{unitIndex}: {unit.name}
                        </span>

                        {isUnitFree && (
                          <span className="ml-2 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            Free
                          </span>
                        )}
                      </div>
                    </div>

                    {unit.activities.map((activity, aIndex) => {
                      const activityIndex = aIndex + 1;
                      const isActivityFree =
                        freePercentage >= (activity._percentage ?? 0);

                      return (
                        <Fragment key={activity.id}>
                          <div className="py-1 pl-12">
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full bg-green-600/90 mr-2" />
                              <span
                                className={cn(
                                  "text-sm",
                                  isActivityFree
                                    ? "text-blue-400"
                                    : "text-muted-foreground"
                                )}
                              >
                                Activity {sectionIndex}.{unitIndex}.
                                {activityIndex}: {activity.name}
                              </span>

                              {isActivityFree && (
                                <span className="ml-2 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                  Free
                                </span>
                              )}
                            </div>
                          </div>

                          {activity.content.map((content, cIndex) => {
                            const contentIndex = cIndex + 1;
                            return (
                              <Fragment key={content.id}>
                                <div className="py-1 pl-[4.5rem]">
                                  <div className="flex items-center">
                                    <div
                                      className={cn(
                                        "h-3 w-3 rounded-full bg-green-600/90 mr-2",
                                        `bg-${
                                          content.type === "lesson"
                                            ? "orange"
                                            : "indigo"
                                        }-600/90`
                                      )}
                                    />

                                    <span
                                      className={cn(
                                        "text-sm",
                                        isActivityFree
                                          ? "text-blue-400"
                                          : "text-muted-foreground"
                                      )}
                                    >
                                      {content.type === "lesson"
                                        ? "Lesson"
                                        : "Quiz"}{" "}
                                      {sectionIndex}.{unitIndex}.{activityIndex}
                                      .{contentIndex}: {content.name}
                                    </span>

                                    {isActivityFree && (
                                      <span className="ml-2 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                        Free
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Fragment>
                            );
                          })}
                        </Fragment>
                      );
                    })}
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
