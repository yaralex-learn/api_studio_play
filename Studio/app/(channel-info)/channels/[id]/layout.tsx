"use client";

import { ChannelHeader } from "@/components/channel-header";
import ChannelProvider from "@/providers/channel-provider";
import { useParams } from "next/navigation";
import type React from "react";

export default function ChannelIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();

  return (
    <ChannelProvider channelID={params.id}>
      <div className="min-h-screen dark:bg-[#0D1117] bg-gray-50">
        <ChannelHeader />
        <div>{children}</div>
      </div>
    </ChannelProvider>
  );
}
