"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import {
  Home,
  Users,
  Car,
  Calendar,
  ClipboardList,
  FileText,
  Receipt,
  Package,
  Warehouse,
  Truck,
  DollarSign,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Cog,
  Menu,
  X
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isFeatureEnabled } = useFeatureFlags();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { href: "/", label: "Kezdőlap", icon: Home, enabled: true },
    { href: "/customers", label: "Ügyfelek", icon: Users, enabled: isFeatureEnabled("crm") },
    { href: "/vehicles", label: "Járművek", icon: Car, enabled: isFeatureEnabled("vehicles") },
    { href: "/calendar", label: "Időpontok", icon: Calendar, enabled: isFeatureEnabled("calendar") },
    { href: "/work-orders", label: "Munkalapok", icon: ClipboardList, enabled: isFeatureEnabled("work_orders") },
    { href: "/reception", label: "Munkafelvevő", icon: FileText, enabled: true },
    { href: "/workshop", label: "Műhely Tablet", icon: Wrench, enabled: true },
    { href: "/invoicing", label: "Számlák", icon: Receipt, enabled: isFeatureEnabled("invoicing") },
    { href: "/inventory", label: "Alkatrészek & Raktár", icon: Package, enabled: isFeatureEnabled("inventory") },
    { href: "/suppliers", label: "Beszállítók", icon: Truck, enabled: isFeatureEnabled("suppliers") },
    { href: "/time-tracking", label: "Pénzügyek & Munkaidő", icon: DollarSign, enabled: isFeatureEnabled("time_tracking") },
    { href: "/reminders", label: "Emlékeztetők", icon: BarChart3, enabled: isFeatureEnabled("reminders") },
    { href: "/users", label: "Munkatársak & Jogok", icon: Users, enabled: true },
    { href: "/settings", label: "Beállítások", icon: Settings, enabled: true },
  ].filter((item) => item.enabled);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-blue-600 text-white rounded-xl shadow-2xl"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{ backgroundColor: "#0f172a" }}
        className={`fixed top-0 bottom-0 left-0 z-40 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 text-slate-300 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 flex items-center gap-3.5 border-b border-slate-800/80">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
              <Wrench className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-lg font-black text-white tracking-wider flex items-center gap-1.5">
                  <span>MŰHELY</span>
                  <span className="text-blue-400">PRO</span>
                </div>
                <div className="text-xs text-slate-400 font-medium truncate">
                  Autószerelő rendszer
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 max-h-[calc(100vh-180px)] overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={isActive ? { backgroundColor: "#0078d7", color: "#ffffff" } : {}}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "shadow-lg shadow-blue-600/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Collapse & Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 text-xs font-bold text-slate-400 hover:text-white w-full px-2 py-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            {collapsed ? (
              <>
                <ChevronRight className="w-5 h-5 mx-auto" />
              </>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Összehúzás</span>
              </>
            )}
          </button>

          {!collapsed && (
            <div className="text-[11px] text-slate-500 font-medium px-2">
              © 2026 MűhelyPro Kft.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
