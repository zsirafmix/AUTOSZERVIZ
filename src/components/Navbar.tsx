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
  ShieldCheck,
  Search,
  ScanLine,
  Sparkles,
  Building2,
  Menu,
  X,
  Play,
  Square,
  Activity,
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
    notifications,
  } = useWorkshop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter navigation items by Feature Flags
  const navItems = [
    { href: "/", label: "Vezetői KPI", icon: Activity, enabled: true },
    { href: "/reception", label: "Munkafelvevő", icon: ClipboardList, enabled: true },
    { href: "/workshop", label: "Műhely Tablet", icon: Wrench, enabled: true },
    { href: "/work-orders", label: "Munkalapok", icon: ClipboardList, enabled: isFeatureEnabled("work_orders") },
    { href: "/customers", label: "Ügyfelek", icon: Users, enabled: isFeatureEnabled("crm") },
    { href: "/vehicles", label: "Járművek", icon: Car, enabled: isFeatureEnabled("vehicles") },
    { href: "/calendar", label: "Naptár", icon: Calendar, enabled: isFeatureEnabled("calendar") },
    { href: "/inventory", label: "Raktár", icon: Package, enabled: isFeatureEnabled("inventory") },
    { href: "/suppliers", label: "Beszállítók", icon: Truck, enabled: isFeatureEnabled("suppliers") },
    { href: "/time-tracking", label: "Munkaidő", icon: Clock, enabled: isFeatureEnabled("time_tracking") },
    { href: "/invoicing", label: "Számlázás", icon: Receipt, enabled: isFeatureEnabled("invoicing") },
    { href: "/reminders", label: "Emlékeztetők", icon: Bell, enabled: isFeatureEnabled("reminders") },
    { href: "/portal", label: "Ügyfélportál", icon: UserCircle, enabled: isFeatureEnabled("customer_portal") },
    { href: "/settings", label: "Beállítások", icon: Settings, enabled: true },
  ].filter((item) => item.enabled);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-lg">
      {/* Top Utility Bar */}
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-950/70">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            AutoMester Pro ERP v2.6
          </span>

          {/* Branch Switcher */}
          {isFeatureEnabled("multi_branch") && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowBranchMenu(!showBranchMenu)}
                className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentBranch?.name || "Központi Műhely"}</span>
              </button>
              {showBranchMenu && (
                <div className="absolute left-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50">
                  {availableBranches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setCurrentBranch(b);
                        setShowBranchMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 ${
                        currentBranch.id === b.id ? "text-blue-400 font-bold bg-slate-700/50" : "text-slate-200"
                      }`}
                    >
                      <div className="font-medium">{b.name}</div>
                      <div className="text-slate-400 text-[10px]">{b.address} ({b.bayCount} emelő)</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Timers Badge */}
          {activeTimers.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Futó munka ({activeTimers.length}):</span>
              {activeTimers.map((t) => (
                <div key={t.workOrderId} className="flex items-center gap-1 font-mono font-bold">
                  <span>{t.licensePlate}</span>
                  <span className="text-white">{formatTimer(t.elapsedSeconds)}</span>
                  <button
                    onClick={() => stopTimer(t.workOrderId)}
                    title="Munka megállítása"
                    className="p-0.5 hover:bg-amber-600/50 rounded text-red-400 hover:text-white"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                {currentUser?.name?.charAt(0) || "U"}
              </div>
              <span className="font-medium">{currentUser?.name || "Felhasználó"}</span>
              <span className="px-1.5 py-0.2 text-[9px] rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                {currentUser?.role}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] text-slate-400 border-b border-slate-700">
                  Szerepkör és dolgozó váltása:
                </div>
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 flex items-center justify-between ${
                      currentUser.id === u.id ? "text-blue-400 font-bold bg-slate-700/50" : "text-slate-200"
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] text-slate-400">{u.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 text-slate-400 hover:text-slate-200 relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-md shadow-2xl p-2 z-50 text-xs">
                <div className="font-semibold text-slate-300 pb-1.5 border-b border-slate-700 flex justify-between">
                  <span>Értesítések</span>
                  <span className="text-slate-400 text-[10px]">{notifications.length} db</span>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-700/50 mt-1">
                  {notifications.map((n, i) => (
                    <div key={i} className="py-1.5 text-slate-300 text-[11px]">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-black text-lg tracking-tight text-white">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="leading-none">
              <span className="text-white font-bold">Auto</span>
              <span className="text-blue-400 font-extrabold">Mester</span>
              <span className="text-xs ml-1 text-amber-400 font-semibold uppercase tracking-wider">Pro</span>
            </div>
          </Link>

          {/* Quick Search Bar */}
          <div className="hidden md:flex items-center relative w-64 lg:w-72">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Keresés (Rendszám, név, tel)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden px-4 pb-4 pt-2 border-t border-slate-800 bg-slate-900 grid grid-cols-2 gap-2 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 p-2.5 rounded-lg font-medium ${
                  active ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4 text-blue-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
