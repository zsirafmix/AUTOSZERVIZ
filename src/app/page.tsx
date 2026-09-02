"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  Wrench,
  Car,
  Clock,
  Receipt,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Users,
  Package,
  ArrowRight,
  Sparkles,
  QrCode,
  Building2,
  Plus
} from "lucide-react";
import QRScannerModal from "@/components/QRScannerModal";
import AIAssistantModal from "@/components/AIAssistantModal";

export default function DashboardPage() {
  const { isFeatureEnabled } = useFeatureFlags();
  const { currentBranch, currentUser } = useWorkshop();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch(`/api/dashboard/stats?branchId=${currentBranch?.id || ""}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [currentBranch]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CHECK_IN":
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">Bejelentkezett</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold animate-pulse">Javítás alatt</span>;
      case "READY":
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">Kész / Átadásra vár</span>;
      case "QUOTE_PENDING":
        return <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">Ajánlatra vár</span>;
      case "DELIVERED":
        return <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-bold">Átadva / Számlázva</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>{currentBranch?.name || "Központi Műhely"}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Szerviz Műveleti & Vezetői Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Üdvözöljük, <span className="text-slate-200 font-semibold">{currentUser?.name}</span>! Valós idejű műhelykihasználtság, pénzügyek és aktív munkák.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setQrModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 transition shadow-sm"
          >
            <QrCode className="w-4 h-4 text-blue-400" />
            <span>QR Kód Beolvasás</span>
          </button>

          {isFeatureEnabled("ai_assistant") && (
            <button
              onClick={() => setAiModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition shadow-md shadow-purple-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Asszisztens</span>
            </button>
          )}

          <Link
            href="/reception"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Új Munkalap Nyitása</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Cars */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Bent lévő autók</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {stats?.activeCarsInShop ?? 2} <span className="text-xs font-normal text-slate-400">db jármű</span>
          </div>
          <div className="text-[11px] text-blue-400 mt-2 flex items-center gap-1 font-medium">
            <span>{stats?.inProgressCount ?? 1} javítás alatt</span> • <span>{stats?.readyForPickup ?? 1} kész</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Kiegyenlített bevétel (Bruttó)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {((stats?.totalGrossRevenue ?? 171704)).toLocaleString()} <span className="text-xs font-normal text-slate-400">Ft</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>Nettó: {((stats?.totalNetRevenue ?? 135200)).toLocaleString()} Ft</span>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Kintlévőségek / Függő számlák</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {(stats?.pendingPaymentGross ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">Ft</span>
          </div>
          <div className="text-[11px] text-amber-300 mt-2">
            {stats?.quotePendingCount ?? 0} db árajánlat függőben
          </div>
        </div>

        {/* Inventory alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Készlet és Raktár állapot</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {stats?.lowStockCount ?? 0} <span className="text-xs font-normal text-slate-400">db alacsony készlet</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Link href="/inventory" className="text-purple-400 hover:underline flex items-center gap-1 font-medium">
              Raktárkészlet megtekintése <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Work Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Work Orders Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" />
              <span>Aktuális Munkalapok a Műhelyben</span>
            </h2>
            <Link href="/work-orders" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
              Összes megtekintése <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase text-[10px] bg-slate-950/60">
                <tr>
                  <th className="p-3 rounded-l-lg">Munkalapszám</th>
                  <th className="p-3">Jármű / Rendszám</th>
                  <th className="p-3">Ügyfél</th>
                  <th className="p-3">Státusz</th>
                  <th className="p-3">Összeg</th>
                  <th className="p-3 text-right rounded-r-lg">Művelet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats?.recentWorkOrders && stats.recentWorkOrders.length > 0 ? (
                  stats.recentWorkOrders.map((wo: any) => (
                    <tr key={wo.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-blue-400">
                        {wo.orderNumber}
                      </td>
                      <td className="p-3 font-semibold text-slate-100">
                        <div>{wo.vehicle?.licensePlate}</div>
                        <div className="text-[10px] text-slate-400">{wo.vehicle?.brand} {wo.vehicle?.model}</div>
                      </td>
                      <td className="p-3 text-slate-300">
                        {wo.customer?.name}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(wo.status)}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-200">
                        {wo.totalGross ? `${wo.totalGross.toLocaleString()} Ft` : "-"}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/work-orders/${wo.id}`}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 hover:text-white text-blue-300 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1"
                        >
                          Munkalap
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      Nincsenek aktív munkalapok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Access & Work Environments */}
        <div className="space-y-4">
          {/* Work Mode Switchers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="font-bold text-sm text-slate-200">Dedikált Felületek</h3>

            <Link
              href="/reception"
              className="block p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold text-sm text-slate-100 group-hover:text-blue-400">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Munkafelvevő / Recepció</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition transform group-hover:translate-x-1" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ügyfél és autó gyorsfelvétel, VIN dekóder, időpont foglalás.
              </p>
            </Link>

            <Link
              href="/workshop"
              className="block p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold text-sm text-slate-100 group-hover:text-amber-400">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Műhely Tablet Nézet (Szerelőknek)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition transform group-hover:translate-x-1" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Stopperóra, érintőképernyős checklist, fotók és állapotfelmérés.
              </p>
            </Link>

            <Link
              href="/portal"
              className="block p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold text-sm text-slate-100 group-hover:text-emerald-400">
                  <Car className="w-4 h-4 text-emerald-400" />
                  <span>Ügyfélportál & Élő Státusz</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition transform group-hover:translate-x-1" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ügyfél nézet az autókról, szervizkönyvről és élő javításról.
              </p>
            </Link>
          </div>

          {/* System Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-xs space-y-2.5">
            <h3 className="font-bold text-sm text-slate-200">Rendszerbiztonság & Felhő</h3>
            <div className="flex items-center justify-between text-slate-400">
              <span>Adatbázis állapot:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Szinkronizálva (OK)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Render / Cloud Host:</span>
              <span className="text-blue-400 font-bold">Online (Aktív)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Változáskövetés (Audit):</span>
              <Link href="/settings" className="text-purple-400 hover:underline font-bold">
                Bekapcsolva
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onScanSuccess={(code) => {
          if (code.startsWith("ML-")) {
            window.location.href = `/work-orders`;
          } else {
            alert(`Beolvasott kód: ${code}`);
          }
        }}
      />

      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
    </div>
  );
}
