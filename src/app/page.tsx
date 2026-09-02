"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkshop } from "@/context/WorkshopContext";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import {
  Calendar,
  Car,
  ClipboardList,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Clock,
  Package,
  History,
  Wrench,
  UserPlus,
  CarFront,
  FileText,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function DashboardExactPage() {
  const { currentBranch, currentUser } = useWorkshop();
  const { isFeatureEnabled } = useFeatureFlags();

  const [stats, setStats] = useState<any>(null);

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
      }
    }
    loadStats();
  }, [currentBranch]);

  return (
    <div className="space-y-6">
      {/* 1. TOP ROW: 5 VIBRANT COLORFUL TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Tile 1: Mai Időpontok (Ciánkék) */}
        <Link
          href="/calendar"
          style={{ backgroundColor: "#0284c7" }}
          className="p-5 rounded-2xl text-white shadow-lg card-hover flex flex-col justify-between min-h-[160px]"
        >
          <div className="w-9 h-9">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <div className="text-4xl font-black font-mono leading-none">
              {stats?.todayAppointments ?? 0}
            </div>
            <div className="text-base font-bold mt-2">Mai időpontok</div>
            <div className="text-xs text-sky-100 font-medium opacity-90">
              {stats?.newBookings ?? 0} új foglalás
            </div>
          </div>
        </Link>

        {/* Tile 2: Bent Lévő Járművek (Élénkzöld) */}
        <Link
          href="/work-orders"
          style={{ backgroundColor: "#059669" }}
          className="p-5 rounded-2xl text-white shadow-lg card-hover flex flex-col justify-between min-h-[160px]"
        >
          <div className="w-9 h-9">
            <Car className="w-8 h-8" />
          </div>
          <div>
            <div className="text-4xl font-black font-mono leading-none">
              {stats?.activeCarsInShop ?? 0}
            </div>
            <div className="text-base font-bold mt-2">Bent lévő járművek</div>
            <div className="text-xs text-emerald-100 font-medium opacity-90">
              {stats?.inProgressCount ?? 0} javítás alatt
            </div>
          </div>
        </Link>

        {/* Tile 3: Aktív Munkalapok (Narancssárga) */}
        <Link
          href="/work-orders"
          style={{ backgroundColor: "#ea580c" }}
          className="p-5 rounded-2xl text-white shadow-lg card-hover flex flex-col justify-between min-h-[160px]"
        >
          <div className="w-9 h-9">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <div className="text-4xl font-black font-mono leading-none">
              {stats?.activeWorkOrders ?? 0}
            </div>
            <div className="text-base font-bold mt-2">Aktív munkalapok</div>
            <div className="text-xs text-orange-100 font-medium opacity-90">
              {stats?.waitingPartsCount ?? 0} alkatrészre vár
            </div>
          </div>
        </Link>

        {/* Tile 4: Alkatrészek (Lila) */}
        <Link
          href="/inventory"
          style={{ backgroundColor: "#7c3aed" }}
          className="p-5 rounded-2xl text-white shadow-lg card-hover flex flex-col justify-between min-h-[160px]"
        >
          <div className="w-9 h-9">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <div className="text-4xl font-black font-mono leading-none">
              {stats?.totalPartsCount ?? 0}
            </div>
            <div className="text-base font-bold mt-2">Alkatrészek</div>
            <div className="text-xs text-purple-100 font-medium opacity-90">
              {stats?.lowStockCount ?? 0} alacsony készleten
            </div>
          </div>
        </Link>

        {/* Tile 5: Kintlévőségek (Piros / Málna) */}
        <Link
          href="/invoicing"
          style={{ backgroundColor: "#e11d48" }}
          className="p-5 rounded-2xl text-white shadow-lg card-hover flex flex-col justify-between min-h-[160px]"
        >
          <div className="w-9 h-9">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <div className="text-4xl font-black font-mono leading-none">
              {stats?.pendingInvoiceCount ?? 0}
            </div>
            <div className="text-base font-bold mt-2">Kintlévőségek</div>
            <div className="text-xs text-rose-100 font-medium opacity-90">
              {(stats?.pendingPaymentGross ?? 0).toLocaleString()} Ft
            </div>
          </div>
        </Link>

      </div>

      {/* 2. MIDDLE ROW: 4 LARGE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Napi Áttekintés (Teal) */}
        <div
          style={{ backgroundColor: "#0d9488" }}
          className="p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between min-h-[260px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">Napi áttekintés</h3>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>

          <div className="flex items-end justify-between my-2">
            <div>
              <div className="text-xs text-teal-100 font-semibold">Bevétel (ma)</div>
              <div className="text-3xl font-black font-mono mt-0.5">
                {(stats?.todayRevenue ?? 0).toLocaleString()} Ft
              </div>
            </div>

            {/* Visual Mini Bar Chart */}
            <div className="flex items-end gap-1.5 h-16 opacity-75">
              <div className="w-2.5 bg-white/40 rounded-t h-4"></div>
              <div className="w-2.5 bg-white/50 rounded-t h-7"></div>
              <div className="w-2.5 bg-white/60 rounded-t h-5"></div>
              <div className="w-2.5 bg-white/80 rounded-t h-10"></div>
              <div className="w-2.5 bg-white rounded-t h-14"></div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/20 text-xs space-y-1">
            <div className="flex justify-between font-semibold">
              <span className="opacity-80">Munkadíj:</span>
              <span className="font-mono">{(stats?.todayLabor ?? 0).toLocaleString()} Ft</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="opacity-80">Alkatrész:</span>
              <span className="font-mono">{(stats?.todayParts ?? 0).toLocaleString()} Ft</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="opacity-80">Árrés:</span>
              <span className="font-mono">{stats?.marginPercent ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Időpont Naptár (Királykék) */}
        <div
          style={{ backgroundColor: "#2563eb" }}
          className="p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between min-h-[260px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">Időpont naptár</h3>
            <Calendar className="w-5 h-5 opacity-80" />
          </div>

          <div className="space-y-2.5 my-2">
            {stats?.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
              stats.upcomingAppointments.slice(0, 3).map((app: any, idx: number) => (
                <div key={idx} className="text-xs flex items-start gap-2.5 bg-black/20 p-2.5 rounded-xl">
                  <span className="font-mono font-black text-sky-300">{app.time}</span>
                  <div>
                    <div className="font-bold">{app.customerName}</div>
                    <div className="text-[11px] text-sky-100 opacity-80">{app.service} - {app.plate}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-black/15 rounded-xl text-center text-xs text-sky-100 space-y-2">
                <div>Nincs mai időpont rögzítve.</div>
                <Link
                  href="/calendar"
                  className="inline-block px-3 py-1.5 bg-white text-blue-700 font-bold rounded-lg text-xs shadow"
                >
                  + Időpont felvétele
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/calendar"
            className="text-xs font-bold text-sky-200 hover:text-white flex items-center justify-end gap-1 transition"
          >
            <span>Összes időpont</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Munkalap Státuszok (Zöld) */}
        <div
          style={{ backgroundColor: "#10b981" }}
          className="p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between min-h-[260px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">Munkalap státuszok</h3>
            <ClipboardList className="w-5 h-5 opacity-80" />
          </div>

          <div className="flex items-center justify-between my-2 gap-3">
            <div className="space-y-1 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>Diagnosztika:</span>
                <span className="font-mono font-bold">{stats?.diagnosticsCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                <span>Javítás alatt:</span>
                <span className="font-mono font-bold">{stats?.inProgressCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span>Alkatrészre vár:</span>
                <span className="font-mono font-bold">{stats?.waitingPartsCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-300"></span>
                <span>Kész:</span>
                <span className="font-mono font-bold">{stats?.readyCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-950"></span>
                <span>Átadva:</span>
                <span className="font-mono font-bold">{stats?.deliveredCount ?? 0}</span>
              </div>
            </div>

            {/* Visual Donut / Pie Illustration */}
            <div className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center font-black text-xs font-mono bg-black/20 shrink-0 shadow-inner">
              {stats?.activeWorkOrders ?? 0} db
            </div>
          </div>

          <div className="pt-2 border-t border-white/20 text-xs font-bold flex justify-between">
            <span>Összesen:</span>
            <span className="font-mono">{stats?.activeWorkOrders ?? 0}</span>
          </div>
        </div>

        {/* Card 4: Gyorsműveletek (Sötétlila) */}
        <div
          style={{ backgroundColor: "#6d28d9" }}
          className="p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between min-h-[260px]"
        >
          <h3 className="text-lg font-black">Gyorsműveletek</h3>

          <div className="grid grid-cols-2 gap-2.5 my-2">
            <Link
              href="/reception"
              className="p-3 rounded-xl bg-black/25 hover:bg-black/40 text-white flex flex-col items-center justify-center text-center gap-1.5 transition"
            >
              <Wrench className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-bold">Új munkalap</span>
            </Link>

            <Link
              href="/calendar"
              className="p-3 rounded-xl bg-black/25 hover:bg-black/40 text-white flex flex-col items-center justify-center text-center gap-1.5 transition"
            >
              <Calendar className="w-5 h-5 text-sky-300" />
              <span className="text-xs font-bold">Új időpont</span>
            </Link>

            <Link
              href="/customers"
              className="p-3 rounded-xl bg-black/25 hover:bg-black/40 text-white flex flex-col items-center justify-center text-center gap-1.5 transition"
            >
              <UserPlus className="w-5 h-5 text-emerald-300" />
              <span className="text-xs font-bold">Új ügyfél</span>
            </Link>

            <Link
              href="/vehicles"
              className="p-3 rounded-xl bg-black/25 hover:bg-black/40 text-white flex flex-col items-center justify-center text-center gap-1.5 transition"
            >
              <CarFront className="w-5 h-5 text-rose-300" />
              <span className="text-xs font-bold">Új jármű</span>
            </Link>
          </div>

          <Link
            href="/reception"
            className="w-full py-2 bg-black/30 hover:bg-black/50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
          >
            <FileText className="w-4 h-4 text-purple-200" />
            <span>Árajánlat készítése</span>
          </Link>
        </div>

      </div>

      {/* 3. BOTTOM ROW: 4 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Bottom Card 1: Késő Munkák (Piros) */}
        <div
          style={{ backgroundColor: "#dc2626" }}
          className="p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between min-h-[220px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">Késő munkák</h3>
            <Clock className="w-5 h-5 opacity-80" />
          </div>

          <div className="py-4 text-xs space-y-2">
            {stats?.overdueOrders && stats.overdueOrders.length > 0 ? (
              stats.overdueOrders.map((o: any, i: number) => (
                <div key={i} className="bg-black/20 p-2 rounded-lg flex justify-between">
                  <span className="font-bold">{o.plate}</span>
                  <span className="text-rose-200">{o.delay}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-rose-100 font-medium p-3 bg-black/15 rounded-xl">
                Nincsenek késésben lévő munkák.
              </div>
            )}
          </div>

          <Link
            href="/work-orders"
            className="text-xs font-bold text-rose-200 hover:text-white flex items-center justify-end gap-1 transition"
          >
            <span>Összes késő munka</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bottom Card 2: Alacsony Készlet (Narancs) */}
        <div
          style={{ backgroundColor: "#ea580c" }}
          className="p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between min-h-[220px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">Alacsony készlet</h3>
            <Package className="w-5 h-5 opacity-80" />
          </div>

          <div className="py-4 text-xs space-y-2">
            {stats?.lowStockParts && stats.lowStockParts.length > 0 ? (
              stats.lowStockParts.map((p: any, i: number) => (
                <div key={i} className="bg-black/20 p-2 rounded-lg flex justify-between">
                  <span className="font-bold truncate max-w-[140px]">{p.name}</span>
                  <span className="font-mono font-bold text-yellow-300">{p.quantity} db</span>
                </div>
              ))
            ) : (
              <div className="text-center text-orange-100 font-medium p-3 bg-black/15 rounded-xl">
                Minden alkatrész megfelelő készletszinten van.
              </div>
            )}
          </div>

          <Link
            href="/inventory"
            className="text-xs font-bold text-orange-200 hover:text-white flex items-center justify-end gap-1 transition"
          >
            <span>Összes alkatrész</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bottom Card 3: Legutóbbi Tevékenységek (Kék) */}
        <div
          style={{ backgroundColor: "#1d4ed8" }}
          className="p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between min-h-[220px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">Legutóbbi tevékenységek</h3>
            <History className="w-5 h-5 opacity-80" />
          </div>

          <div className="py-4 text-xs space-y-2">
            {stats?.recentLogs && stats.recentLogs.length > 0 ? (
              stats.recentLogs.map((l: any, i: number) => (
                <div key={i} className="bg-black/20 p-2 rounded-lg flex justify-between items-center">
                  <span className="truncate max-w-[140px]">{l.desc}</span>
                  <span className="text-[10px] text-sky-200 font-mono">{l.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-sky-100 font-medium p-3 bg-black/15 rounded-xl">
                Nincs legutóbbi tevékenység.
              </div>
            )}
          </div>

          <Link
            href="/settings"
            className="text-xs font-bold text-sky-200 hover:text-white flex items-center justify-end gap-1 transition"
          >
            <span>Összes tevékenység</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bottom Card 4: Következő Szervizek (Sötétzöld) */}
        <div
          style={{ backgroundColor: "#047857" }}
          className="p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between min-h-[220px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">Következő szervizek</h3>
            <Car className="w-5 h-5 opacity-80" />
          </div>

          <div className="py-4 text-xs space-y-2">
            {stats?.upcomingReminders && stats.upcomingReminders.length > 0 ? (
              stats.upcomingReminders.map((r: any, i: number) => (
                <div key={i} className="bg-black/20 p-2 rounded-lg flex justify-between">
                  <span className="font-bold">{r.plate}</span>
                  <span className="text-emerald-200">{r.date}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-emerald-100 font-medium p-3 bg-black/15 rounded-xl">
                Nincs közelgő szerviz emlékeztető.
              </div>
            )}
          </div>

          <Link
            href="/reminders"
            className="text-xs font-bold text-emerald-200 hover:text-white flex items-center justify-end gap-1 transition"
          >
            <span>Összes szerviz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
