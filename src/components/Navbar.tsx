"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  Wrench,
  Users,
  Car,
  Calendar,
  ClipboardList,
  Package,
  Truck,
  Clock,
  Receipt,
  Bell,
  Settings,
  Search,
  Building2,
  Menu,
  X,
  Play,
  Square,
  ChevronDown,
  LayoutGrid,
  UserCircle
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { isFeatureEnabled } = useFeatureFlags();
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

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b-2 border-slate-700 text-white shadow-xl">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition">
              <LayoutGrid className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>AUTOMESTER</span>
                <span className="bg-amber-500 text-black px-2 py-0.5 rounded text-xs font-black uppercase">PRO</span>
              </div>
              <div className="text-xs text-slate-400 font-semibold">
                Műhelyirányítási Rendszer
              </div>
            </div>
          </Link>

          {isFeatureEnabled("multi_branch") && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowBranchMenu(!showBranchMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 border-2 border-slate-600 rounded-xl text-sm font-bold text-slate-100 transition shadow"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{currentBranch?.name || "Központi Szerviz"}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {showBranchMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-800 border-2 border-slate-600 rounded-xl shadow-2xl p-2 z-50">
                  {availableBranches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setCurrentBranch(b);
                        setShowBranchMenu(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg text-sm font-bold transition flex items-center justify-between ${
                        currentBranch.id === b.id
                          ? "bg-blue-600 text-white"
                          : "text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      <div>
                        <div>{b.name}</div>
                        <div className="text-xs font-normal opacity-80">{b.address}</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-black/30 rounded font-mono">{b.bayCount} állás</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTimers.length > 0 && (
            <div className="flex items-center gap-3 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg font-bold animate-pulse text-sm">
              <span>⏱️ Futó szerelés:</span>
              {activeTimers.map((t) => (
                <div key={t.workOrderId} className="flex items-center gap-2 font-mono text-base font-black">
                  <span className="bg-black/40 px-2 py-0.5 rounded">{t.licensePlate}</span>
                  <span>{formatTimer(t.elapsedSeconds)}</span>
                  <button
                    onClick={() => stopTimer(t.workOrderId)}
                    title="Leállítás"
                    className="p-1.5 bg-white text-red-600 hover:bg-slate-200 rounded text-xs font-black uppercase"
                  >
                    Stop
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center relative w-64">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Gyorskeresés..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border-2 border-slate-600 rounded-xl text-sm font-bold text-white transition"
            >
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-xs font-black">
                {currentUser?.name?.charAt(0) || "U"}
              </div>
              <span className="hidden sm:inline">{currentUser?.name}</span>
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded font-mono uppercase">{currentUser?.role}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border-2 border-slate-600 rounded-xl shadow-2xl p-2 z-50">
                <div className="text-xs font-bold text-slate-400 px-3 py-1.5 uppercase border-b border-slate-700 mb-1">
                  Szerepkör váltás:
                </div>
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold transition flex items-center justify-between ${
                      currentUser.id === u.id
                        ? "bg-blue-600 text-white"
                        : "text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-xs font-mono opacity-75">{u.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl flex items-center gap-2 shadow"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Kezdőlap (Csempék)</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
