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
  UserCircle,
  ChevronDown
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
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80 text-slate-100 shadow-2xl transition-all duration-300">
      {/* Top Status & Switcher Bar */}
      <div className="px-4 sm:px-6 py-1.5 border-b border-slate-800/50 flex items-center justify-between text-xs bg-slate-950/90">
        <div className="flex items-center gap-3 sm:gap-6">
          <span className="flex items-center gap-2 text-blue-400 font-bold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-extrabold">
              AutoMester Pro ERP
            </span>
            <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono">
              v2.6 Enterprise
            </span>
          </span>

          {/* Branch Selector */}
          {isFeatureEnabled("multi_branch") && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowBranchMenu(!showBranchMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800/90 rounded-lg border border-slate-700/60 text-slate-300 hover:text-white transition shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">{currentBranch?.name || "Központi Műhely"}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              {showBranchMenu && (
                <div className="absolute left-0 mt-1.5 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  {availableBranches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setCurrentBranch(b);
                        setShowBranchMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs transition ${
                        currentBranch.id === b.id
                          ? "text-blue-400 font-bold bg-blue-500/10 border-l-2 border-blue-500"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-slate-400 text-[10px]">{b.address} ({b.bayCount} emelő)</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Stopwatch Timers */}
          {activeTimers.length > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-300 border border-amber-500/30 px-3 py-0.5 rounded-full shadow-inner">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-semibold hidden lg:inline">Futó szerelés:</span>
              {activeTimers.map((t) => (
                <div key={t.workOrderId} className="flex items-center gap-1.5 font-mono font-black text-xs">
                  <span className="text-white bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">{t.licensePlate}</span>
                  <span className="text-amber-400 animate-pulse">{formatTimer(t.elapsedSeconds)}</span>
                  <button
                    onClick={() => stopTimer(t.workOrderId)}
                    title="Munka leállítása"
                    className="p-1 bg-red-500/20 hover:bg-red-500 rounded text-red-400 hover:text-white transition"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* User Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 rounded-lg text-slate-200 transition"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                {currentUser?.name?.charAt(0) || "U"}
              </div>
              <span className="font-semibold hidden sm:inline">{currentUser?.name || "Felhasználó"}</span>
              <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase tracking-wider">
                {currentUser?.role}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                  Szerepkör váltása:
                </div>
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition flex items-center justify-between ${
                      currentUser.id === u.id
                        ? "text-blue-400 font-bold bg-blue-500/10 border-l-2 border-blue-500"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{u.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-950 animate-pulse"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 text-xs animate-in fade-in">
                <div className="font-bold text-slate-200 pb-2 border-b border-slate-800 flex justify-between items-center">
                  <span>Rendszer Értesítések</span>
                  <span className="text-slate-400 text-[10px] px-1.5 py-0.5 bg-slate-800 rounded font-mono">
                    {notifications.length} db
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 mt-1.5 pr-1">
                  {notifications.map((n, i) => (
                    <div key={i} className="py-2 text-slate-300 text-[11px] leading-relaxed">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black text-lg tracking-tight">Auto</span>
                <span className="text-blue-400 font-black text-lg tracking-tight">Mester</span>
                <span className="px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] rounded uppercase tracking-wider shadow-sm">
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                Műhelyirányítási Rendszer
              </div>
            </div>
          </Link>

          {/* Quick Search */}
          <div className="hidden md:flex items-center relative w-64 lg:w-80">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Gyorskeresés (Rendszám, név, tel)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition shadow-inner"
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-[1.02]"
                    : "text-slate-300 hover:text-white hover:bg-slate-850 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-blue-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden px-4 pb-4 pt-2 border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl grid grid-cols-2 gap-2 text-xs animate-in fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 p-3 rounded-xl font-semibold transition ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-slate-900 text-slate-200 hover:bg-slate-800"
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
