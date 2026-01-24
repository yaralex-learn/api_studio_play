"use client";

import { FloatingChatButton } from "@/components/floating-chat-button";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar, TabletSidebar } from "@/components/sidebar";
import type React from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Tablet Sidebar (icons only) */}
        <TabletSidebar />

        {/* Main Content */}
        <main className="flex-1 pb-20 sm:pb-0 sm:pl-20 lg:pl-64">
          {children}
        </main>

        {/* Mobile Bottom Navigation - will only show on mobile */}
        <div className="block sm:hidden">
          <Sidebar />
        </div>

        {/* Floating Chat Button */}
        <FloatingChatButton />
      </div>
    </ProtectedRoute>
  );
}
