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
  Plus,
  ShieldCheck,
  Activity,
  ChevronRight
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
        return <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>Bejelentkezett</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Javítás alatt</span>;
      case "READY":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Kész / Átadásra vár</span>;
      case "QUOTE_PENDING":
        return <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Ajánlatra vár</span>;
      case "DELIVERED":
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Átadva / Lezárva</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 border border-slate-700/60 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentBranch?.name || "Központi Szervizműhely"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Szerviz Műveleti & Vezetői Irányítópult
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Üdvözöljük, <span className="text-white font-bold">{currentUser?.name}</span>! Valós idejű műhelykihasználtság, pénzügyi mutatók, beérkező és kész járművek áttekintése.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setQrModalOpen(true)}
              className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700/80 flex items-center gap-2 shadow-md hover:scale-105 transition-all"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>QR Munkalap Olvasó</span>
            </button>

            {isFeatureEnabled("ai_assistant") && (
              <button
                onClick={() => setAiModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 hover:scale-105 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Műhely Asszisztens</span>
              </button>
            )}

            <Link
              href="/reception"
              className="btn-gradient-primary px-5 py-2.5 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-xl shadow-blue-600/30 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Új Munkalap Nyitása</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Cars */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bent lévő autók</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-sm">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">
            {stats?.activeCarsInShop ?? 2} <span className="text-xs font-sans font-normal text-slate-400">db autó</span>
          </div>
          <div className="text-xs text-blue-400 mt-2.5 flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>{stats?.inProgressCount ?? 1} javítás alatt</span> • <span className="text-emerald-400">{stats?.readyForPickup ?? 1} kész</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kiegyenlített forgalom</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-3 font-mono">
            {((stats?.totalGrossRevenue ?? 171704)).toLocaleString()} <span className="text-xs font-sans font-normal text-slate-400">Ft</span>
          </div>
          <div className="text-xs text-slate-400 mt-2.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Nettó: {((stats?.totalNetRevenue ?? 135200)).toLocaleString()} Ft</span>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Függő számlák & Kintlévőség</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 mt-3 font-mono">
            {(stats?.pendingPaymentGross ?? 0).toLocaleString()} <span className="text-xs font-sans font-normal text-slate-400">Ft</span>
          </div>
          <div className="text-xs text-amber-300 mt-2.5 flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{stats?.quotePendingCount ?? 0} db árajánlat jóváhagyásra vár</span>
          </div>
        </div>

        {/* Inventory alerts */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raktár & Alkatrészek</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-sm">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3 font-mono">
            {stats?.lowStockCount ?? 0} <span className="text-xs font-sans font-normal text-slate-400">db alacsony készlet</span>
          </div>
          <div className="text-xs text-purple-400 mt-2.5 flex items-center gap-1 font-semibold">
            <Link href="/inventory" className="hover:underline flex items-center gap-1">
              Raktárkészlet kezelése <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Work Orders Card */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Wrench className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-lg text-white">
                Aktuális Munkalapok a Műhelyben
              </h2>
            </div>

            <Link
              href="/work-orders"
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 transition"
            >
              Összes munkalap megnyitása <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase text-[10px] bg-slate-950/60 font-bold tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Munkalapszám</th>
                  <th className="p-3.5">Jármű / Rendszám</th>
                  <th className="p-3.5">Ügyfél</th>
                  <th className="p-3.5">Státusz</th>
                  <th className="p-3.5">Bruttó összeg</th>
                  <th className="p-3.5 text-right rounded-r-xl">Művelet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats?.recentWorkOrders && stats.recentWorkOrders.length > 0 ? (
                  stats.recentWorkOrders.map((wo: any) => (
                    <tr key={wo.id} className="hover:bg-slate-800/40 transition group">
                      <td className="p-3.5 font-mono font-bold text-blue-400 group-hover:text-blue-300">
                        {wo.orderNumber}
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        <div>{wo.vehicle?.licensePlate}</div>
                        <div className="text-[10px] font-normal text-slate-400">{wo.vehicle?.brand} {wo.vehicle?.model}</div>
                      </td>
                      <td className="p-3.5 text-slate-300 font-medium">
                        {wo.customer?.name}
                      </td>
                      <td className="p-3.5">
                        {getStatusBadge(wo.status)}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        {wo.totalGross ? `${wo.totalGross.toLocaleString()} Ft` : "-"}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/work-orders/${wo.id}`}
                          className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 hover:text-white text-blue-300 rounded-xl font-bold text-[11px] transition inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Megnyitás</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                      Nincsenek aktív munkalapok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Access Work Environments */}
        <div className="space-y-5">
          <div className="glass-panel rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Munkakörnyezetek
            </h3>

            <div className="space-y-3">
              <Link
                href="/reception"
                className="block p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/60 transition-all duration-300 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 font-bold text-sm text-slate-100 group-hover:text-blue-400 transition">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>Recepció & Munkafelvevő</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transform group-hover:translate-x-1 transition" />
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  1 perces gyors járműfelvétel, VIN dekóder, azonnali munkalap nyitás.
                </p>
              </Link>

              <Link
                href="/workshop"
                className="block p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 transition-all duration-300 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 font-bold text-sm text-slate-100 group-hover:text-amber-400 transition">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <span>Műhely Tablet (Szerelőknek)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transform group-hover:translate-x-1 transition" />
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Érintőképernyős nagygombos stopper, sérüléstérkép és checklist.
                </p>
              </Link>

              <Link
                href="/portal"
                className="block p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all duration-300 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Car className="w-4 h-4" />
                    </div>
                    <span>Ügyfél Portál & Élő Státusz</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition" />
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Saját autók, digitális szervizkönyv, számlák és online nyomkövető.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>

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
