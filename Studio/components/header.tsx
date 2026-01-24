"use client";

import {
  Bell,
  FolderOpen,
  LineChart,
  MessageSquare,
  Moon,
  Radio,
  Search,
  ShoppingCart,
  Sun,
  User,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import toFileUrl from "@/utils/to-file-url";
import { LogOut } from "lucide-react";
import LogoutDialog from "./dialogs/logout-dialog";
import FileSpaceManagerModal from "./file-space-manager/file-space-manager-modal";

// Define a simple className utility function to replace cn
function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [fileManagerOpen, setFileManagerOpen] = useState(false);

  const navItems = [
    // {
    //   name: "Dashboard",
    //   href: "/",
    //   active: pathname === "" || pathname === "/",
    //   icon: LayoutDashboard,
    // },
    {
      name: "Channels",
      href: "/channels",
      active: pathname.startsWith("/channels"),
      icon: Radio,
    },
    {
      name: "Market",
      href: "/market",
      active: pathname.startsWith("/market"),
      icon: ShoppingCart,
    },
    {
      name: "Tracking",
      href: "/tracking",
      active: pathname.startsWith("/tracking"),
      icon: LineChart,
    },
    {
      name: "Discuss",
      href: "/discuss",
      active: pathname.startsWith("/discuss"),
      icon: MessageSquare,
    },
    {
      name: "Live",
      href: "/live",
      active: pathname.startsWith("/live"),
      icon: Video,
    },
  ];

  return (
    <>
      <header className="px-6 w-full dark:bg-[#010409] bg-gray-50 border-b dark:border-neutral-700 border-gray-200">
        <div className="flex h-14 items-center">
          <div className="flex items-center me-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/logo.png"
                alt="Yaralex Studio Logo"
                width={24}
                height={24}
                className="h-6 w-auto"
              />
              <span className="font-bold text-lg">Yaralex Studio</span>
            </Link>
          </div>

          <div className="relative w-[300px] mx-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="What you looking for?"
              className="pl-10 dark:bg-neutral-700 bg-gray-100 border-none h-9 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex-1"></div>

          <div className="flex items-center gap-2">
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

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="w-full flex flex-row items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                >
                  <div className="w-full flex flex-row items-center gap-2">
                    {isDark ? (
                      <>
                        <Sun className="h-4 w-4" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <LogoutDialog asChild>
                    <Button
                      className="w-full h-min flex flex-row items-center justify-start gap-2 rounded-sm px-2 py-1.5 text-sm text-red-500 dark:text-red-400"
                      variant="ghost"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </LogoutDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <nav className="flex h-12 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                "flex h-12 items-center px-4 text-sm font-medium transition-colors hover:text-primary relative",
                item.active
                  ? "text-foreground border-b-2 dark:border-white border-black"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="me-2 h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </header>

      {/* File Space Manager Modal */}
      <FileSpaceManagerModal
        open={fileManagerOpen}
        onOpenChange={setFileManagerOpen}
      />
    </>
  );
}
