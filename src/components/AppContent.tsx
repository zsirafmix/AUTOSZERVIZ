"use client";

import React from "react";
import { useWorkshop } from "@/context/WorkshopContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import SecurityLockModal from "@/components/SecurityLockModal";

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { isLocked, unlockApp } = useWorkshop();

  return (
    <>
      <SecurityLockModal isLocked={isLocked} onUnlock={unlockApp} />
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </>
  );
}
