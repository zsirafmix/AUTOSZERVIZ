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
  Truck,
  Bell,
  Settings,
  Sparkles,
  QrCode,
  Building2,
  Plus,
  ShieldCheck,
  Activity,
  ArrowRight,
  ClipboardList,
  UserCircle,
  FileText
} from "lucide-react";
import QRScannerModal from "@/components/QRScannerModal";
import AIAssistantModal from "@/components/AIAssistantModal";

export default function MetroDashboardPage() {
  const { isFeatureEnabled } = useFeatureFlags();
  const { currentBranch, currentUser } = useWorkshop();

  const [stats, setStats] = useState<any>(null);
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
      }
    }
    loadStats();
  }, [currentBranch]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Metro Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-slate-700">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            AutoMester Műhelyközpont
          </h1>
          <p className="text-base sm:text-xl text-slate-300 font-semibold mt-2">
            Érintse meg vagy kattintson a kívánt funkció csempéjére a megnyitáshoz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setQrModalOpen(true)}
            className="metro-tile bg-slate-800 hover:bg-slate-750 text-white px-6 py-3.5 rounded-xl font-bold text-base border-2 border-slate-600 flex items-center gap-2.5 shadow-lg"
          >
            <QrCode className="w-6 h-6 text-amber-400" />
            <span>QR Kód Olvasó</span>
          </button>

          {isFeatureEnabled("ai_assistant") && (
            <button
              onClick={() => setAiModalOpen(true)}
              className="metro-tile bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold text-base flex items-center gap-2.5 shadow-lg border-2 border-purple-500"
            >
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <span>AI Műhely Asszisztens</span>
            </button>
          )}
        </div>
      </div>

      {/* WINDOWS 8 METRO TILES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* 1. MUNKAFELVEVŐ / RECEPCIÓ (Nagy Zöld Csempe) */}
        <Link
          href="/reception"
          className="metro-tile bg-emerald-600 text-white p-7 rounded-2xl shadow-2xl flex flex-col justify-between min-h-[220px] group col-span-1 sm:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-black/20 rounded-2xl">
              <Plus className="w-12 h-12 text-white" />
            </div>
            <span className="px-4 py-1.5 bg-black/30 rounded-xl text-sm font-black uppercase tracking-wider">
              1 Perces Felvétel
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              ÚJ JÁRMŰ & MUNKALAP FELVÉTEL
            </h2>
            <p className="text-base text-emerald-100 font-semibold mt-1.5">
              Munkafelvevő recepció: Ügyféladatok, automatikus alvázszám (VIN) dekóder és azonnali indítás.
            </p>
          </div>
        </Link>

        {/* 2. MŰHELY TABLET MÓD (Nagy Narancssárga Csempe) */}
        <Link
          href="/workshop"
          className="metro-tile bg-orange-600 text-white p-7 rounded-2xl shadow-2xl flex flex-col justify-between min-h-[220px] group col-span-1 sm:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-black/20 rounded-2xl">
              <Wrench className="w-12 h-12 text-white" />
            </div>
            <span className="px-4 py-1.5 bg-black/30 rounded-xl text-sm font-black uppercase tracking-wider">
              Szerelőknek (Tablet)
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              MŰHELY TABLET & STOPPERÓRA
            </h2>
            <p className="text-base text-orange-100 font-semibold mt-1.5">
              Érintőképernyős nagygombos szerelői felület, élő Start/Stop időmérő, állapotfelmérő checklist.
            </p>
          </div>
        </Link>

        {/* 3. MUNKALAPOK (Kék Csempe) */}
        {isFeatureEnabled("work_orders") && (
          <Link
            href="/work-orders"
            className="metro-tile bg-blue-600 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <ClipboardList className="w-9 h-9" />
              </div>
              <span className="text-4xl font-black font-mono">
                {stats?.activeCarsInShop ?? 0}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Munkalapok</h3>
              <p className="text-sm text-blue-100 font-semibold mt-1">Folyamatban lévő és kész szervizek</p>
            </div>
          </Link>
        )}

        {/* 4. ÜGYFÉLNYILVÁNTARTÁS CRM (Lila Csempe) */}
        {isFeatureEnabled("crm") && (
          <Link
            href="/customers"
            className="metro-tile bg-purple-700 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <Users className="w-9 h-9" />
              </div>
              <span className="text-sm px-3 py-1 bg-black/30 rounded-lg font-black uppercase">CRM</span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Ügyfelek</h3>
              <p className="text-sm text-purple-100 font-semibold mt-1">Cégadatok, adószámok, előzmények</p>
            </div>
          </Link>
        )}

        {/* 5. JÁRMŰVEK & SZERVIZKÖNYV (Indigó Csempe) */}
        {isFeatureEnabled("vehicles") && (
          <Link
            href="/vehicles"
            className="metro-tile bg-indigo-700 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <Car className="w-9 h-9" />
              </div>
              <span className="text-sm px-3 py-1 bg-black/30 rounded-lg font-black uppercase">Flotta</span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Gépjárművek</h3>
              <p className="text-sm text-indigo-100 font-semibold mt-1">Alvázszámok, műszaki, szervizkönyv</p>
            </div>
          </Link>
        )}

        {/* 6. NAPTÁR & EMELŐK (Teal Csempe) */}
        {isFeatureEnabled("calendar") && (
          <Link
            href="/calendar"
            className="metro-tile bg-teal-600 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <Calendar className="w-9 h-9" />
              </div>
              <span className="text-sm px-3 py-1 bg-black/30 rounded-lg font-black uppercase">Emelők</span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Naptár & Emelők</h3>
              <p className="text-sm text-teal-100 font-semibold mt-1">Időpontfoglalás és műhelybeosztás</p>
            </div>
          </Link>
        )}

        {/* 7. RAKTÁR & ALKATRÉSZEK (Borostyán Csempe) */}
        {isFeatureEnabled("inventory") && (
          <Link
            href="/inventory"
            className="metro-tile bg-amber-600 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <Package className="w-9 h-9" />
              </div>
              <span className="text-4xl font-black font-mono">
                {stats?.lowStockCount ?? 0}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Raktárkészlet</h3>
              <p className="text-sm text-amber-100 font-semibold mt-1">Cikkszámok, készletszintek, polchelyek</p>
            </div>
          </Link>
        )}

        {/* 8. BESZÁLLÍTÓK (Unix, Bárdi, IC) (Ciánkék Csempe) */}
        {isFeatureEnabled("suppliers") && (
          <Link
            href="/suppliers"
            className="metro-tile bg-cyan-700 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <Truck className="w-9 h-9" />
              </div>
              <span className="text-sm px-3 py-1 bg-black/30 rounded-lg font-black uppercase">Beszerzés</span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Beszállítók</h3>
              <p className="text-sm text-cyan-100 font-semibold mt-1">Unix, Bárdi, Inter Cars rendelések</p>
            </div>
          </Link>
        )}

        {/* 9. MUNKAIDŐ & STOPPER (Piros Csempe) */}
        {isFeatureEnabled("time_tracking") && (
          <Link
            href="/time-tracking"
            className="metro-tile bg-rose-700 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <Clock className="w-9 h-9" />
              </div>
              <span className="text-sm px-3 py-1 bg-black/30 rounded-lg font-black uppercase">Időmérés</span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Munkaidő Napló</h3>
              <p className="text-sm text-rose-100 font-semibold mt-1">Szerelői munkaórák és stopperek</p>
            </div>
          </Link>
        )}

        {/* 10. SZÁMLÁZÁS & PÉNZÜGYEK (Fukszia Csempe) */}
        {isFeatureEnabled("invoicing") && (
          <Link
            href="/invoicing"
            className="metro-tile bg-fuchsia-700 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <Receipt className="w-9 h-9" />
              </div>
              <span className="text-sm px-3 py-1 bg-black/30 rounded-lg font-black uppercase">Pénzügy</span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Számlázás</h3>
              <p className="text-sm text-fuchsia-100 font-semibold mt-1">Számlák, díjbekérők, bevételek</p>
            </div>
          </Link>
        )}

        {/* 11. SZERVIZEMLÉKEZTETŐK (Sárga Csempe) */}
        {isFeatureEnabled("reminders") && (
          <Link
            href="/reminders"
            className="metro-tile bg-yellow-600 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <Bell className="w-9 h-9" />
              </div>
              <span className="text-sm px-3 py-1 bg-black/30 rounded-lg font-black uppercase">Automata</span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Emlékeztetők</h3>
              <p className="text-sm text-yellow-100 font-semibold mt-1">Olajcsere (1év/15e km), műszaki</p>
            </div>
          </Link>
        )}

        {/* 12. ÜGYFÉL PORTÁL (Smaragdzöld Csempe) */}
        {isFeatureEnabled("customer_portal") && (
          <Link
            href="/portal"
            className="metro-tile bg-emerald-700 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <UserCircle className="w-9 h-9" />
              </div>
              <span className="text-sm px-3 py-1 bg-black/30 rounded-lg font-black uppercase">Ügyfél</span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Ügyfél Portál</h3>
              <p className="text-sm text-emerald-100 font-semibold mt-1">Saját járművek & szervizkönyv</p>
            </div>
          </Link>
        )}

        {/* 13. RENDSZERBEÁLLÍTÁSOK & FEATURE FLAGS (Sötétszürke Dupla Csempe) */}
        <Link
          href="/settings"
          className="metro-tile bg-slate-700 text-white p-7 rounded-2xl shadow-2xl flex flex-col justify-between min-h-[200px] col-span-1 sm:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-black/20 rounded-2xl">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <span className="px-4 py-1.5 bg-black/30 rounded-xl text-sm font-black uppercase tracking-wider">
              16 Modul Kapcsoló
            </span>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black">Rendszerbeállítások & Modulok</h3>
            <p className="text-base text-slate-200 font-semibold mt-1">
              Egyenként ki- és bekapcsolhatja az összes modult, módosíthatja az árakat és a telephelyeket.
            </p>
          </div>
        </Link>

      </div>

      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onScanSuccess={(code) => {
          if (code.startsWith("ML-")) {
            window.location.href = `/work-orders`;
          } else {
            alert(`Beolvasott azonosító: ${code}`);
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
