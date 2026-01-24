"use client";

import {
  IChannelSectionOutline,
  ISelectedChannelContentItem,
} from "@/types/channel-outline";
import ChannelOutlineModifier from "@/utils/channel-outline-modifier";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, PropsWithChildren, useContext, useState } from "react";

interface ChannelOutlineContextType {
  isOpen: boolean;
  selectedContent?: ISelectedChannelContentItem;
  outlineModifier: ChannelOutlineModifier;
  toggleSidebar: () => void;
  isExpanded: (itemId: string) => boolean;
  isSelected: (itemId: string) => boolean;
  expandAll: (sections: IChannelSectionOutline[]) => void;
  collapseAll: () => void;
  setSelectedContent: (item?: ISelectedChannelContentItem) => void;
  toggleExpand: (
    itemId: string,
    options?: { force?: "expand" | "collapse" }
  ) => void;
}

const ChannelOutlineContext = createContext<
  ChannelOutlineContextType | undefined
>(undefined);

export function ChannelOutlineProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedContent, setSelectedContent] = useState<
    ISelectedChannelContentItem | undefined
  >();

  const outlineModifier = new ChannelOutlineModifier(queryClient, {
    onDelete: (id) => {
      if (selectedContent?.data.id === id) {
        setSelectedContent(undefined);
      }
    },
    onUpdate: (data) => {
      if (selectedContent?.data.id === data.id) {
        setSelectedContent((pv) =>
          pv ? { ...pv, data: { ...pv?.data, ...data } } : undefined
        );
      }
    },
  });

  const isExpanded = (id: string) => expandedItems.has(id);

  const isSelected = (id: string) => selectedContent?.data.id === id;

  const toggleExpand = (
    id: string,
    options?: { force?: "expand" | "collapse" }
  ) => {
    const _tempItems = new Set<string>(expandedItems);

    if (options?.force) {
      if (options.force === "expand") {
        _tempItems.add(id);
      } else if (options.force === "collapse") {
        _tempItems.delete(id);
      }
    } else if (_tempItems.has(id)) {
      _tempItems.delete(id);
    } else {
      _tempItems.add(id);
    }

    setExpandedItems(_tempItems);
  };

  const expandAll = (sections: IChannelSectionOutline[]) => {
    const _expandedItems = new Set<string>();

    for (const s of sections) {
      _expandedItems.add(s.id);
      for (const u of s.units) {
        _expandedItems.add(u.id);
        for (const a of u.activities) {
          _expandedItems.add(a.id);
        }
      }
    }

    setExpandedItems(_expandedItems);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <ChannelOutlineContext.Provider
      value={{
        isOpen,
        selectedContent,
        outlineModifier,
        toggleSidebar,
        isExpanded,
        isSelected,
        expandAll,
        collapseAll,
        setSelectedContent,
        toggleExpand,
      }}
    >
      {children}
    </ChannelOutlineContext.Provider>
  );
}

export function useChannelOutline() {
  const context = useContext(ChannelOutlineContext);
  if (context === undefined) {
    throw new Error(
      "useChannelOutline must be used within a ChannelOutlineProvider"
    );
  }
  return context;
}
