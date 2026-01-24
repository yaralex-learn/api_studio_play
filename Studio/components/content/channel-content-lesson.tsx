"use client";

import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useChannelOutline } from "@/providers/channel-outline-provider";
import { useChannel } from "@/providers/channel-provider";
import { IChannelLessonContentItem } from "@/types/channel-content-lesson";
import {
  IChannelContentOutline,
  ISelectedChannelContentItemAncestors,
} from "@/types/channel-outline";
import { reorderArray } from "@/utils/arrays";
import { useMutation } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { Reorder } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import ChannelContentHeader from "./channel-content-header";
import { LessonContentItem } from "./channel-content-lesson-item";
import { LessonContentItemThumbnail } from "./channel-content-lesson-item-thumbnail";
import { SelectTemplateModal } from "./select-template-modal";

type TChannelLessonContentProps = {
  lesson: IChannelContentOutline;
  indexSequence: number[];
  ancestors?: ISelectedChannelContentItemAncestors;
};

export default function ChannelLessonContent({
  lesson,
  indexSequence,
  ancestors,
}: TChannelLessonContentProps) {
  const { refreshToken } = useAuth();
  const { channel } = useChannel();
  const { outlineModifier } = useChannelOutline();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deletingCardId, setDeletingCardId] = useState<string | null>();
  const [formData, setFormData] = useState<IChannelLessonContentItem[]>([]);
  const [openSelectTemplateModal, setOpenSelectTemplateModal] = useState(false);
  const [mainCarouselRef, mainCarousel] = useEmblaCarousel({
    loop: false,
    align: "start",
    watchDrag: false,
  });

  useEffect(
    () => setFormData(lesson.content as IChannelLessonContentItem[]),
    [lesson.content]
  );

  // Initialize Main Carousel
  useEffect(() => {
    if (!mainCarousel) return;

    const onSelectItem = () => {
      if (!mainCarousel) return;
      const index = mainCarousel.selectedScrollSnap();
      setCurrentIndex(index);
    };

    mainCarousel.on("select", onSelectItem);

    return () => {
      mainCarousel.off("select", onSelectItem);
    };
  }, [mainCarousel]);

  const saveChannelLessonMutation = useMutation({
    mutationKey: ["saveChannelLessonMutation", { id: lesson.id }],
    mutationFn: async () => {
      await refreshToken();

      let res = await Api.post(
        `/studio/channel/content/${channel.channel_id}/lessons/`,
        formData
      );
      return res.data;
    },
    onSuccess: (data) => {
      outlineModifier.update.content({
        id: lesson.id,
        sectionId: ancestors?.sectionId ?? "UNKNOWN",
        unitId: ancestors?.unitId ?? "UNKNOWN",
        activityId: ancestors?.activityId ?? "UNKNOWN",
        data: { content: data },
      });

      Toast.s({
        title: "Changes applied!",
        description: "Your changes saved successfully!",
      });
    },
  });

  // Reorder cards and update carousel
  const handleReorder = (newOrder: IChannelLessonContentItem[]) => {
    setFormData(reorderArray(newOrder));
    // After reordering, we need to reset the carousel
    setTimeout(() => {
      if (mainCarousel) {
        mainCarousel.reInit();
        mainCarousel.scrollTo(formData.length);
      }
    }, 100);
  };

  const handleChangeItem = ({
    index,
    data,
  }: {
    index: number;
    data: Record<string, any>;
  }) => {
    const _tempFormData = [...formData];
    _tempFormData[index] = { ..._tempFormData[index], ...data };
    setFormData(_tempFormData);
  };

  const handleDeleteItem = ({ index, id }: { index: number; id: string }) => {
    setDeletingCardId(id);

    // Wait for animation to complete before removing from state
    setTimeout(() => {
      setDeletingCardId(null);

      let _tempFormData = [...formData];
      _tempFormData.splice(index, 1);
      _tempFormData = reorderArray(_tempFormData);

      setFormData(_tempFormData);

      outlineModifier.update.content({
        id: lesson.id,
        sectionId: ancestors?.sectionId ?? "UNKNOWN",
        unitId: ancestors?.unitId ?? "UNKNOWN",
        activityId: ancestors?.activityId ?? "UNKNOWN",
        data: { content: _tempFormData },
      });

      // After deleting a card, reinitialize the carousel
      if (mainCarousel) {
        setTimeout(() => {
          mainCarousel.reInit();
          // If we deleted the last card, scroll to the new last card
          if (currentIndex >= formData.length - 1) {
            mainCarousel.scrollTo(Math.max(0, formData.length - 2));
          }
        }, 0);
      }
    }, 300); // Match this duration with the CSS animation duration
  };

  const handleDuplicateItem = ({
    index,
    item,
  }: {
    index: number;
    item: IChannelLessonContentItem;
  }) => {
    setFormData((pv) => {
      const _tempPv = [...pv];
      _tempPv.splice(index + 1, 0, {
        ...item,
        id: `new-lesson-content-item-${item.order}-${Date.now()}`,
        _new: true,
      });
      return reorderArray(_tempPv);
    });

    Toast.s({
      title: "Item duplicated!",
      description: "Your changes saved successfully!",
    });

    // After adding a new card, reinitialize the carousel
    setTimeout(() => {
      if (mainCarousel) {
        mainCarousel.reInit();
        mainCarousel.scrollTo(index + 1);
      }
    }, 100);
  };

  return (
    <>
      <ChannelContentHeader
        className="mb-0 border-none"
        type="Lesson"
        name={lesson.name}
        indexSequence={indexSequence}
        isSaving={saveChannelLessonMutation.isPending}
        onSave={() => saveChannelLessonMutation.mutate()}
      />

      {/* Thumbnails */}
      <div className="mb-16 pt-2 pb-4 border-b">
        <Reorder.Group
          axis="x"
          values={formData}
          onReorder={handleReorder}
          className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {formData.map((item, index) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className="flex-shrink-0 cursor-grab"
              data-reorder-item
            >
              <LessonContentItemThumbnail
                data={item}
                isSelected={currentIndex === index}
                onClick={() => mainCarousel?.scrollTo(index)}
              />
            </Reorder.Item>
          ))}

          {/* Add new card thumbnail */}
          <div>
            <div
              className="!w-12 !h-8 rounded-md flex items-center justify-center border border-dashed cursor-pointer"
              onClick={() => setOpenSelectTemplateModal(true)}
            >
              <PlusIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Reorder.Group>
      </div>

      {/* Main carousel */}
      <div className="relative">
        <div className="overflow-hidden" ref={mainCarouselRef}>
          <div className="flex">
            {formData.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "flex-[0_0_100%] min-w-0 pl-4 first:pl-0",
                  deletingCardId === item.id && "deleting-card"
                )}
              >
                <LessonContentItem
                  data={item}
                  onChange={(data) => handleChangeItem({ index, data })}
                  onDelete={() => handleDeleteItem({ index, id: item.id })}
                  onDuplicate={() => handleDuplicateItem({ index, item })}
                />
              </div>
            ))}

            <div className="flex-[0_0_100%] min-w-0 pl-4 first:pl-0">
              <Card
                className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center border-dashed cursor-pointer py-36"
                onClick={() => setOpenSelectTemplateModal(true)}
              >
                <PlusIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Add New Item</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation buttons - only show when there are actual cards */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-[18dvh] -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => mainCarousel?.scrollPrev()}
          disabled={formData.length === 0 || currentIndex === 0}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-[18dvh] -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => mainCarousel?.scrollNext()}
          disabled={formData.length === 0 || currentIndex === formData.length}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      <SelectTemplateModal
        open={openSelectTemplateModal}
        lessonId={lesson.id}
        lastOrder={formData.length + 1}
        onOpenChange={setOpenSelectTemplateModal}
        onSelectTemplate={(newItem) => {
          setOpenSelectTemplateModal(false);
          handleReorder([...formData, newItem]);
        }}
      />
    </>
  );
}
