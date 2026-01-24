"use client";

import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useChannel } from "@/providers/channel-provider";
import toFileUrl from "@/utils/to-file-url";
import {
  Bell,
  ChevronLeft,
  Eye,
  FileText,
  FolderOpen,
  Globe,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PublishChannelDialog } from "./dialogs/publish-channel-dialog";
import FileSpaceManagerModal from "./file-space-manager/file-space-manager-modal";

export function ChannelHeader() {
  const { user } = useAuth();
  const { channel, updateChannelInfo } = useChannel();
  const pathname = usePathname();
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Get the base path for this channel
  const basePath = `/channels/${channel.channel_id}`;

  // Define the tabs with icons
  const tabs = [
    {
      key: "content",
      name: "Content",
      href: `${basePath}/content`,
      icon: FileText,
    },
    {
      key: "preview",
      name: "Preview",
      href: `${basePath}/preview`,
      icon: Eye,
    },
    {
      key: "settings",
      name: "Settings",
      href: `${basePath}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="border-b dark:border-neutral-800 border-gray-200">
      <div className="dark:bg-[#010409] bg-gray-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href={"/channels"} className="mr-3">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="Yaralex Studio Logo"
              width={24}
              height={24}
              className="h-6 w-auto"
            />
            <h1 className="text-lg font-bold">{channel.name}</h1>
          </div>
          {channel.published ? (
            <span className="ml-3 px-3 py-1 text-xs font-medium rounded-full bg-green-600 text-white">
              Published
            </span>
          ) : (
            <span className="ml-3 px-3 py-1 text-xs font-medium rounded-full bg-amber-600 text-white">
              Draft
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Publish Button */}
          <PublishChannelDialog
            channelId={channel.channel_id}
            isPublished={channel.published}
            onChange={(published) => updateChannelInfo({ published })}
            asChild
          >
            <Button className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Publish
            </Button>
          </PublishChannelDialog>

          {/* Files Button */}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setFileManagerOpen(true)}
          >
            <FolderOpen className="h-4 w-4" />
            Files
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  {user?.avatar_url && (
                    <AvatarImage src={toFileUrl(user.avatar_url)} />
                  )}
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                <div className="flex items-center w-full">
                  {isDark ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-6 dark:bg-[#010409] bg-gray-50 shadow-sm">
        <nav className="flex">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                "dark:hover:text-white hover:text-gray-900",
                pathname.endsWith(tab.key)
                  ? "dark:text-white text-gray-900 border-b-2 dark:border-white border-gray-900"
                  : "dark:text-neutral-400 text-neutral-500"
              )}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
      {/* File Space Manager Modal */}
      <FileSpaceManagerModal
        open={fileManagerOpen}
        onOpenChange={setFileManagerOpen}
      />
    </div>
  );
}
