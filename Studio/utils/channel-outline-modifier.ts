import { GET_CHANNEL_QUERY_KEY } from "@/providers/channel-provider";
import { IChannelInfo } from "@/types/channel";
import {
  IChannelActivityOutline,
  IChannelContentOutline,
  IChannelSectionOutline,
  IChannelUnitOutline,
} from "@/types/channel-outline";
import { QueryClient } from "@tanstack/react-query";

type TChannelOutlineModifier = {
  onInsert?: (data: Record<string, any>) => void;
  onUpdate?: (data: Record<string, any>) => void;
  onDelete?: (id: string) => void;
};

export default class ChannelOutlineModifier {
  private queryClient: QueryClient;
  private onInsert?: (data: Record<string, any>) => void;
  private onUpdate?: (data: Record<string, any>) => void;
  private onDelete?: (id: string) => void;

  constructor(queryClient: QueryClient, options?: TChannelOutlineModifier) {
    this.queryClient = queryClient;
    this.onInsert = options?.onInsert;
    this.onUpdate = options?.onUpdate;
    this.onDelete = options?.onDelete;
  }

  private updateOutline(
    modifier: (sections: IChannelSectionOutline[]) => IChannelSectionOutline[]
  ) {
    this.queryClient.setQueryData(
      GET_CHANNEL_QUERY_KEY,
      (old: IChannelInfo | undefined) => {
        if (!old) return old;
        return {
          ...old,
          outline_content: { sections: modifier(old.outline_content.sections) },
        };
      }
    );
  }

  // :: Modify Sections
  private insertSection = (newItem: Record<string, any>) => {
    this.updateOutline((sections) => {
      return [
        ...sections,
        {
          units: [],
          description: null,
          file_id: null,
          ...newItem,
        } as unknown as IChannelSectionOutline,
      ];
    });
    this.onInsert?.(newItem);
  };

  private updateSection = ({
    id,
    data,
  }: {
    id: string;
    data: Record<string, any>;
  }) => {
    this.updateOutline((sections) => {
      return sections.map((s) => (s.id === id ? { ...s, ...data } : s));
    });
    this.onUpdate?.(data);
  };

  private deleteSection = (id: string) => {
    this.updateOutline((sections) => {
      return sections.filter((s) => s.id !== id);
    });
    this.onDelete?.(id);
  };

  // :: Modify Units
  private insertUnit = ({
    sectionId,
    newItem,
  }: {
    sectionId: string;
    newItem: Record<string, any>;
  }) => {
    this.updateOutline((sections) => {
      return sections.map((s) => {
        let units = s.units;
        if (s.id === sectionId) {
          units = [
            ...units,
            {
              activities: [],
              description: null,
              file_id: null,
              ...newItem,
            } as unknown as IChannelUnitOutline,
          ];
        }

        return { ...s, units };
      });
    });
    this.onInsert?.(newItem);
  };

  private updateUnit = ({
    sectionId,
    id,
    data,
  }: {
    sectionId: string;
    id: string;
    data: Record<string, any>;
  }) => {
    this.updateOutline((sections) => {
      return sections.map((s) => {
        let units = s.units;
        if (s.id === sectionId) {
          units = units.map((u) => (u.id === id ? { ...u, ...data } : u));
        }
        return { ...s, units };
      });
    });
    this.onUpdate?.(data);
  };

  private deleteUnit = ({
    sectionId,
    id,
  }: {
    sectionId: string;
    id: string;
  }) => {
    this.updateOutline((sections) => {
      return sections.map((s) => {
        let units = s.units;
        if (s.id === sectionId) {
          units = units.filter((s) => s.id !== id);
        }
        return { ...s, units };
      });
    });
    this.onDelete?.(id);
  };

  // :: Modify Activities
  private insertActivity = ({
    sectionId,
    unitId,
    newItem,
  }: {
    sectionId: string;
    unitId: string;
    newItem: Record<string, any>;
  }) => {
    this.updateOutline((sections) => {
      return sections.map((section) => {
        if (section.id !== sectionId) return section;

        const units = section.units.map((unit) => {
          if (unit.id !== unitId) return unit;

          const activities = [
            ...unit.activities,
            {
              count: 0,
              content: [],
              description: null,
              file_id: null,
              difficulty_level: null,
              is_launched: false,
              ...newItem,
            } as unknown as IChannelActivityOutline,
          ];

          return { ...unit, activities };
        });

        return { ...section, units };
      });
    });
    this.onInsert?.(newItem);
  };

  private updateActivity = ({
    sectionId,
    unitId,
    id,
    data,
  }: {
    sectionId: string;
    unitId: string;
    id: string;
    data: Record<string, any>;
  }) => {
    this.updateOutline((sections) => {
      return sections.map((section) => {
        if (section.id !== sectionId) return section;

        const units = section.units.map((unit) => {
          if (unit.id !== unitId) return unit;

          const activities = unit.activities.map((activity) =>
            activity.id === id ? { ...activity, ...data } : activity
          );

          return { ...unit, activities };
        });

        return { ...section, units };
      });
    });
    this.onUpdate?.(data);
  };

  private deleteActivity = ({
    sectionId,
    unitId,
    id,
  }: {
    sectionId: string;
    unitId: string;
    id: string;
  }) => {
    this.updateOutline((sections) => {
      return sections.map((section) => {
        if (section.id !== sectionId) return section;

        const units = section.units.map((unit) => {
          if (unit.id !== unitId) return unit;

          const activities = unit.activities.filter(
            (activity) => activity.id !== id
          );

          return { ...unit, activities };
        });

        return { ...section, units };
      });
    });
    this.onDelete?.(id);
  };

  // :: Modify Contents
  private insertContent = ({
    sectionId,
    unitId,
    activityId,
    newItem,
  }: {
    sectionId: string;
    unitId: string;
    activityId: string;
    newItem: Record<string, any>;
  }) => {
    this.updateOutline((sections) => {
      return sections.map((section) => {
        if (section.id !== sectionId) return section;

        const units = section.units.map((unit) => {
          if (unit.id !== unitId) return unit;

          const activities = unit.activities.map((activity) => {
            if (activity.id !== activityId) return activity;

            const content = [
              ...activity.content,
              {
                count: 0,
                content: [],
                is_launched: false,
                is_free: false,
                ...newItem,
              } as unknown as IChannelContentOutline,
            ];

            return { ...activity, content };
          });

          return { ...unit, activities };
        });

        return { ...section, units };
      });
    });
    this.onInsert?.(newItem);
  };

  private updateContent = ({
    sectionId,
    unitId,
    activityId,
    id,
    data,
  }: {
    sectionId: string;
    unitId: string;
    activityId: string;
    id: string;
    data:
      | Record<string, any>
      | ((pv: IChannelContentOutline) => Record<string, any>);
  }) => {
    this.updateOutline((sections) => {
      return sections.map((section) => {
        if (section.id !== sectionId) return section;

        const units = section.units.map((unit) => {
          if (unit.id !== unitId) return unit;

          const activities = unit.activities.map((activity) => {
            if (activity.id !== activityId) return activity;

            const content = activity.content.map((c) => {
              if (c.id === id) {
                if (typeof data === "function") {
                  return { ...c, ...data(c) };
                } else {
                  return { ...c, ...data };
                }
              }
              return c;
            });

            return { ...activity, content };
          });

          return { ...unit, activities };
        });

        return { ...section, units };
      });
    });
    this.onUpdate?.(data);
  };

  private deleteContent = ({
    sectionId,
    unitId,
    activityId,
    id,
  }: {
    sectionId: string;
    unitId: string;
    activityId: string;
    id: string;
  }) => {
    this.updateOutline((sections) => {
      return sections.map((section) => {
        if (section.id !== sectionId) return section;

        const units = section.units.map((unit) => {
          if (unit.id !== unitId) return unit;

          const activities = unit.activities.map((activity) => {
            if (activity.id !== activityId) return activity;

            const content = activity.content.filter((c) => c.id !== id);

            return { ...activity, content };
          });

          return { ...unit, activities };
        });

        return { ...section, units };
      });
    });
    this.onDelete?.(id);
  };

  insert = {
    section: this.insertSection,
    unit: this.insertUnit,
    activity: this.insertActivity,
    content: this.insertContent,
  };

  update = {
    section: this.updateSection,
    unit: this.updateUnit,
    activity: this.updateActivity,
    content: this.updateContent,
  };

  delete = {
    section: this.deleteSection,
    unit: this.deleteUnit,
    activity: this.deleteActivity,
    content: this.deleteContent,
  };
}
