"use client";

import { YaralexLogo } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Update the navItems array to include new items and remove profile
const navItems = [
  {
    name: "Channels",
    href: "/channels",
    icon: "/images/home-button.png",
    color: "bg-[#FF9600]",
  },
  {
    name: "Practice",
    href: "/practice",
    icon: "/images/target.png",
    color: "bg-[#1CB0F6]",
  },
  {
    name: "Flashcards",
    href: "/flashcards",
    icon: "/images/flash-card.png",
    color: "bg-[#FF9600]",
  },
  {
    name: "Subscription",
    href: "/subscription",
    icon: "/crown.png",
    color: "bg-[#FFAA00]",
  },
  {
    name: "Live",
    href: "/live",
    icon: "/live-streaming.png",
    color: "bg-[#FF4B4B]",
  },
];

// Replace the Sidebar function with this updated version
export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useMobile();
  const { user } = useAuth();

  // For mobile view - bottom navigation bar
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 z-50 w-full border-t-2 border-white/20 bg-yaralex-background shadow-lg">
        <div className="grid h-16 grid-cols-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                pathname === item.href ? "text-white" : "text-white/60"
              )}
            >
              <div className="h-8 w-8 relative">
                <Image
                  src={item.icon || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>
              {/* Removed item text in mobile mode */}
            </Link>
          ))}

          {/* Profile section at the bottom */}
          <Link
            href="/profile"
            className="flex flex-col items-center justify-center gap-1"
          >
            <div className="h-8 w-8 relative rounded-full overflow-hidden">
              <Image
                src={user?.avatar || "/placeholder.svg"}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // For desktop view
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-yaralex-background border-r-2 border-white/20 flex flex-col">
      <div className="flex-1">
        {/* Updated header: made text bolder and bigger, left-aligned */}
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center">
            <span className="text-3xl text-yaralex-green font-bagelFatOne">
              Yaralex Play
            </span>
          </Link>
        </div>

        {/* Reduced space between header and items */}
        <nav className="space-y-3 px-3 pt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl p-2 transition-all duration-200",
                  isActive
                    ? "bg-white/15 border-2 border-white/30"
                    : "hover:bg-white/10 border-2 border-transparent"
                )}
              >
                <div className="h-8 w-8 relative">
                  <Image
                    src={item.icon || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-md text-white">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile section at the bottom */}
      <div className="px-3 pb-4">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-xl p-3 transition-all duration-200",
            pathname === "/profile"
              ? "bg-white/15 border-2 border-white/30"
              : "hover:bg-white/10 border-2 border-transparent"
          )}
        >
          <div className="h-10 w-10 relative rounded-full overflow-hidden">
            <Image
              src={user?.avatar || "/placeholder.svg"}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {`${user?.first_name ?? ""} ${user?.last_name ?? ""}`}
            </span>
            <span className="text-xs text-white/60">{user?.email ?? ""}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Update the TabletSidebar function
export function TabletSidebar() {
  const pathname = usePathname();
  const isMobile = useMobile();
  const { user } = useAuth();

  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-20 bg-yaralex-background border-r-2 border-white/20 shadow-xl sm:flex lg:hidden flex flex-col">
      <div className="flex-1">
        {/* Updated header: using icon instead of text */}
        <div className="flex h-16 items-center justify-center">
          <Link href="/">
            <YaralexLogo className="h-10 w-10" />
          </Link>
        </div>

        {/* Reduced space between header and items */}
        <nav className="space-y-6 px-2 pt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-200",
                  isActive ? "transform scale-110" : ""
                )}
                title={item.name}
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl relative flex items-center justify-center",
                    isActive ? "border-2 border-white/30 shadow-lg" : ""
                  )}
                >
                  <Image
                    src={item.icon || "/placeholder.svg"}
                    alt={item.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                {/* Removed item text in tablet mode */}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile section at the bottom */}
      <div className="px-2 pb-6">
        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center gap-1 transition-all duration-200",
            pathname === "/profile" ? "transform scale-110" : ""
          )}
          title="Profile"
        >
          <div
            className={cn(
              "h-10 w-10 rounded-full relative flex items-center justify-center overflow-hidden",
              pathname === "/profile"
                ? "border-2 border-white/30 shadow-lg"
                : ""
            )}
          >
            <Image
              src={user?.avatar || "/placeholder.svg"}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
        </Link>
      </div>
    </div>
  );
}
