import {
  IChannelActivityOutline,
  IChannelContentOutline,
  IChannelSectionOutline,
  IChannelUnitOutline,
} from "@/types/channel-outline";

export default function searchChannelOutline(
  sections: IChannelSectionOutline[],
  keyword: string
): IChannelSectionOutline[] {
  const keywordLower = keyword.toLowerCase();

  function filterContents(
    contents: IChannelContentOutline[]
  ): IChannelContentOutline[] {
    return contents
      .map((content) => {
        const matchedSubContents = filterContents(content.content);
        const isMatch = content.name.toLowerCase().includes(keywordLower);

        if (isMatch || matchedSubContents.length > 0) {
          return {
            ...content,
            content: matchedSubContents,
          };
        }

        return null;
      })
      .filter((c): c is IChannelContentOutline => c !== null);
  }

  function filterActivities(
    activities: IChannelActivityOutline[]
  ): IChannelActivityOutline[] {
    return activities
      .map((activity) => {
        const matchedContents = filterContents(activity.content);
        const isMatch = activity.name.toLowerCase().includes(keywordLower);

        if (isMatch || matchedContents.length > 0) {
          return {
            ...activity,
            content: matchedContents,
          };
        }

        return null;
      })
      .filter((a): a is IChannelActivityOutline => a !== null);
  }

  function filterUnits(units: IChannelUnitOutline[]): IChannelUnitOutline[] {
    return units
      .map((unit) => {
        const matchedActivities = filterActivities(unit.activities);
        const isMatch = unit.name.toLowerCase().includes(keywordLower);

        if (isMatch || matchedActivities.length > 0) {
          return {
            ...unit,
            activities: matchedActivities,
          };
        }

        return null;
      })
      .filter((u): u is IChannelUnitOutline => u !== null);
  }

  return sections
    .map((section) => {
      const matchedUnits = filterUnits(section.units);
      const isMatch = section.name.toLowerCase().includes(keywordLower);

      if (isMatch || matchedUnits.length > 0) {
        return {
          ...section,
          units: matchedUnits,
        };
      }

      return null;
    })
    .filter((s): s is IChannelSectionOutline => s !== null);
}
