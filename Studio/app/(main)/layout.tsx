import { Header } from "@/components/header";
import type React from "react";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col dark:bg-[#0D1117] bg-gray-50">
      <Header />
      <main>{children}</main>
    </div>
  );
}
