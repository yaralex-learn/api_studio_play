"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobeIcon, Lock, User } from "lucide-react";
import { useState } from "react";
import ProfileChangePassword from "./profile-change-password";
import ProfileDomainSetup from "./profile-domain-setup";
import ProfilePersonalInfo from "./profile-personal-info";

type TProfileTabs = "personal-info" | "password";

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState<TProfileTabs>("personal-info");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Tabs
        value={activeTab}
        onValueChange={(t) => setActiveTab(t as TProfileTabs)}
        className="w-full flex flex-row gap-6"
      >
        <TabsList className="flex flex-col !items-start !justify-start h-auto bg-transparent space-y-1 p-0 md:w-64 shrink-0">
          <TabsTrigger
            value="personal-info"
            className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted w-full"
          >
            <User className="h-4 w-4 mr-2" />
            Personal Info
          </TabsTrigger>

          <TabsTrigger
            value="password"
            className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted w-full"
          >
            <Lock className="h-4 w-4 mr-2" />
            Password
          </TabsTrigger>

          <TabsTrigger
            value="domain-setup"
            className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted w-full"
          >
            <GlobeIcon className="h-4 w-4 mr-2" />
            Domain Setup
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent value="personal-info" className="mt-0 border-0 p-0">
            <ProfilePersonalInfo />
          </TabsContent>

          <TabsContent value="password" className="mt-0 border-0 p-0">
            <ProfileChangePassword />
          </TabsContent>

          <TabsContent value="domain-setup" className="mt-0 border-0 p-0">
            <ProfileDomainSetup />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
