"use client";

import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { useChannelOutline } from "@/providers/channel-outline-provider";
import { useChannel } from "@/providers/channel-provider";
import { IChannelQuizContentItem } from "@/types/channel-content-quiz";
import {
  IChannelContentOutline,
  ISelectedChannelContentItemAncestors,
} from "@/types/channel-outline";
import { reorderArray } from "@/utils/arrays";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation } from "@tanstack/react-query";
import { PlusCircleIcon, Sparkles } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Button } from "../ui/button";
import ChannelContentHeader from "./channel-content-header";
import SelectQuestionAiTemplateModal from "./question-type-ai-modal";
import SelectQuestionTemplateModal from "./question-type-modal";
import QuizTemplateDivider from "./templates/quiz-template-divider";
import QuizTemplateWrapper from "./templates/quiz-template-wrapper";

type TChannelQuizContentProps = {
  quiz: IChannelContentOutline;
  indexSequence: number[];
  ancestors?: ISelectedChannelContentItemAncestors;
};

export default function ChannelQuizContent({
  quiz,
  indexSequence,
  ancestors,
}: TChannelQuizContentProps) {
  const { refreshToken } = useAuth();
  const { channel } = useChannel();
  const { outlineModifier } = useChannelOutline();
  const [insertIndex, setInsertIndex] = useState<number | undefined>();
  const [formData, setFormData] = useState<IChannelQuizContentItem[]>([]);
  const [showSelectTemplateModal, setShowSelectTemplateModal] = useState(false);
  const [showSelectAiTemplateModal, setShowSelectAiTemplateModal] =
    useState(false);

  useEffect(
    () => setFormData(quiz.content as IChannelQuizContentItem[]),
    [quiz.content]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const saveQuizContentMutation = useMutation({
    mutationKey: ["saveQuizContentMutation", { id: quiz.id }],
    mutationFn: async () => {
      await refreshToken();

      const res = await Api.post(
        `/studio/channel/content/${channel.channel_id}/questions/`,
        formData
      );
      return res.data;
    },
    onSuccess: (data) => {
      outlineModifier.update.content({
        id: quiz.id,
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id.toString() === active.id
        );
        const newIndex = items.findIndex(
          (item) => item.id.toString() === over.id
        );

        return reorderArray(arrayMove(items, oldIndex, newIndex));
      });
    }
  };

  const handleInsertTemplate = (...templates: IChannelQuizContentItem[]) => {
    if (insertIndex != null) {
      setFormData((items) => {
        const tempItems = [...items];
        tempItems.splice(insertIndex, 0, ...templates);
        return reorderArray(tempItems);
      });
    } else {
      setFormData((pv) => {
        const startIndex = pv.length - 1;
        return [...pv, ...reorderArray(templates, startIndex)];
      });
    }

    setInsertIndex(undefined);
    setShowSelectTemplateModal(false);
    setShowSelectAiTemplateModal(false);
  };

  return (
    <>
      <ChannelContentHeader
        type="Quiz"
        name={quiz.name}
        indexSequence={indexSequence}
        isSaving={saveQuizContentMutation.isPending}
        onSave={() => saveQuizContentMutation.mutate()}
      />

      <div className="space-y-0">
        {formData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 min-h-[60dvh]">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">No questions yet</h3>
              <p className="text-muted-foreground">
                Add questions to your quiz to get started
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSelectTemplateModal(true)}
              >
                <PlusCircleIcon className="h-4 w-4 mr-2" /> Add Question
              </Button>

              <Button onClick={() => setShowSelectAiTemplateModal(true)}>
                <Sparkles className="h-4 w-4 mr-2" /> Generate with AI
              </Button>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={formData.map((q) => q.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              {formData.map((question, index) => (
                <Fragment key={question.id}>
                  {index > 0 && (
                    <QuizTemplateDivider
                      onAddQuestion={() => {
                        setInsertIndex(index);
                        setShowSelectTemplateModal(true);
                      }}
                      onGenerateAI={() => {
                        setInsertIndex(index);
                        setShowSelectAiTemplateModal(true);
                      }}
                    />
                  )}

                  <QuizTemplateWrapper
                    key={`question-${question.id}-wrapper`}
                    setFormData={setFormData}
                    question={question}
                    index={index}
                  />
                </Fragment>
              ))}
            </SortableContext>
          </DndContext>
        )}

        {formData.length > 0 && (
          <QuizTemplateDivider
            alwaysVisible
            onAddQuestion={() => {
              setInsertIndex(formData.length);
              setShowSelectTemplateModal(true);
            }}
            onGenerateAI={() => {
              setInsertIndex(formData.length);
              setShowSelectAiTemplateModal(true);
            }}
          />
        )}
      </div>

      <SelectQuestionTemplateModal
        quizId={quiz.id}
        lastOrder={formData.length + 1}
        open={showSelectTemplateModal}
        onSelect={handleInsertTemplate}
        onClose={() => {
          setShowSelectTemplateModal(false);
          setInsertIndex(undefined);
        }}
      />

      <SelectQuestionAiTemplateModal
        quizId={quiz.id}
        lastOrder={formData.length + 1}
        open={showSelectAiTemplateModal}
        onGenerate={handleInsertTemplate}
        onClose={() => {
          setShowSelectAiTemplateModal(false);
          setInsertIndex(undefined);
        }}
      />
    </>
  );
}
