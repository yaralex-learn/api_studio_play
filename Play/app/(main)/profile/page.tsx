"use client";

import LogoutDialog from "@/components/dialogs/logout-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import { RiLogoutBoxFill } from "react-icons/ri";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-yaralex-purple">
          <img
            src="/abstract-user-icon.png"
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-white">{`${
          user?.first_name ?? ""
        } ${user?.last_name ?? ""}`}</h1>
        <p className="text-white/70">{user?.email ?? ""}</p>

        <LogoutDialog asChild>
          <Button
            className="w-min self-center mt-4 rounded-full"
            variant="destructive"
          >
            <RiLogoutBoxFill />
            Logout
          </Button>
        </LogoutDialog>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-white">Your Progress</h2>
        <Card className="border-2 border-white/10 bg-white/5">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="mb-2 flex justify-between">
                <span className="font-medium text-white">Daily Streak</span>
                <span className="font-medium text-yaralex-green">7 days</span>
              </div>
              <Progress value={70} className="h-2 bg-white/20" />
            </div>

            <div className="mb-6">
              <div className="mb-2 flex justify-between">
                <span className="font-medium text-white">XP Points</span>
                <span className="font-medium text-yaralex-blue">1,250 XP</span>
              </div>
              <Progress value={45} className="h-2 bg-white/20" />
            </div>

            <div>
              <div className="mb-2 flex justify-between">
                <span className="font-medium text-white">
                  Lessons Completed
                </span>
                <span className="font-medium text-yaralex-orange">24/50</span>
              </div>
              <Progress value={48} className="h-2 bg-white/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-white/10 bg-white/5">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Achievements</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "First Lesson", color: "bg-yaralex-green" },
                { name: "7 Day Streak", color: "bg-yaralex-blue" },
                { name: "Perfect Score", color: "bg-yaralex-yellow" },
                { name: "Quick Learner", color: "bg-yaralex-orange" },
                { name: "Word Master", color: "bg-yaralex-purple" },
                { name: "Grammar Pro", color: "bg-yaralex-red" },
              ].map((achievement, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${achievement.color}`}
                  >
                    <span className="text-lg font-bold text-black">✓</span>
                  </div>
                  <span className="text-center text-xs text-white/80">
                    {achievement.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-white/10 bg-white/5">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Settings</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Account Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Notification Preferences
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Language Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Privacy Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Help & Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
