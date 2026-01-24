"use client";

import { ChannelInformationSection } from "@/components/channel-settings/channel-information-section";
import { ChannelManagementSection } from "@/components/channel-settings/channel-management-section";
import { CouponsSection } from "@/components/channel-settings/coupons-section";
import { FreeAccessSection } from "@/components/channel-settings/free-access-section";
import { SubscriptionTiersSection } from "@/components/channel-settings/subscription-tiers-section";
import { useState } from "react";

type NavItem =
  | "channel-information"
  | "subscription"
  | "free-access"
  | "coupons"
  | "management";

export default function ChannelSettingsPage() {
  // State for navigation
  const [activeNav, setActiveNav] = useState<NavItem>("channel-information");

  // Navigation items
  const navItems = [
    { id: "channel-information" as NavItem, label: "Channel Information" },
    { id: "subscription" as NavItem, label: "Subscription Tiers" },
    { id: "free-access" as NavItem, label: "Free Access" },
    { id: "coupons" as NavItem, label: "Coupons" },
    { id: "management" as NavItem, label: "Channel Management" },
  ];

  return (
    <div className="container py-6 px-0">
      <div className="flex flex-col md:flex-row">
        {/* Left sidebar navigation */}
        <div className="w-full md:w-64 md:border-r dark:border-gray-800">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                  activeNav === item.id
                    ? "bg-primary/10 border-l-2 border-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right content area */}
        <div className="flex-1 px-6 py-4">
          {/* Render the appropriate section based on activeNav */}
          {activeNav === "channel-information" && <ChannelInformationSection />}
          {activeNav === "subscription" && <SubscriptionTiersSection />}
          {activeNav === "free-access" && <FreeAccessSection />}
          {activeNav === "coupons" && <CouponsSection />}
          {activeNav === "management" && <ChannelManagementSection />}
        </div>
      </div>
    </div>
  );
}
