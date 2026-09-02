"use client";

import React, { useState } from "react";
import { useWorkshop } from "@/context/WorkshopContext";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import {
  Search,
  Bell,
  UserCircle,
  Building2,
  ChevronDown,
  Clock,
  Square
} from "lucide-react";

export default function Navbar() {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    currentBranch,
    setCurrentBranch,
    availableBranches,
    activeTimers,
    stopTimer,
    searchQuery,
    setSearchQuery,
  } = useWorkshop();
  const { isFeatureEnabled } = useFeatureFlags();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <header className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60">
      {/* Left Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Üdvözlünk, {currentUser?.name ? currentUser.name.split(" ")[0] : "Gábor"}!
        </h1>
        <p className="text-sm text-slate-400 font-medium mt-0.5">
          Itt mindent egy helyen kezelhetsz.
        </p>
      </div>

      {/* Right Controls (Search, Bell, User) */}
      <div className="flex items-center gap-4">
        {/* Active Timer Pill */}
        {activeTimers.length > 0 && (
          <div
            style={{ backgroundColor: "#dc2626" }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-lg animate-pulse"
          >
            <span>⏱️</span>
            {activeTimers.map((t) => (
              <span key={t.workOrderId} className="font-mono font-black">
                {t.licensePlate}: {formatTimer(t.elapsedSeconds)}
              </span>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative w-64 md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Keresés..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ backgroundColor: "#1e293b" }}
            className="w-full text-white placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ backgroundColor: "#1e293b" }}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white border border-slate-700/80 relative transition shadow-sm"
          >
            <Bell className="w-5 h-5" />
            <span
              style={{ backgroundColor: "#ef4444" }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center ring-2 ring-slate-900"
            >
              3
            </span>
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ backgroundColor: "#1e293b" }}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl border border-slate-700/80 text-white transition hover:bg-slate-750"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-black text-white shadow">
              {currentUser?.name?.charAt(0) || "G"}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-tight">{currentUser?.name || "Gábor"}</div>
              <div className="text-[10px] text-slate-400 font-semibold">Tulajdonos / Vezető</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div
              style={{ backgroundColor: "#1e293b" }}
              className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in"
            >
              <div className="text-xs font-bold text-slate-400 px-3 py-1.5 uppercase border-b border-slate-700">
                Szerepkör váltása:
              </div>
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                    currentUser.id === u.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <span>{u.name}</span>
                  <span className="text-[10px] font-mono opacity-75">{u.role}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
