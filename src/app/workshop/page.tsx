"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  Wrench,
  Play,
  Square,
  CheckCircle2,
  Clock,
  Camera,
  QrCode,
  FileCheck,
  AlertCircle,
  Plus,
  Package,
  Layers,
  ChevronRight,
  Sparkles
} from "lucide-react";
import QRScannerModal from "@/components/QRScannerModal";
import CarInspectionCanvas from "@/components/CarInspectionCanvas";

export default function WorkshopTabletPage() {
  const { isFeatureEnabled } = useFeatureFlags();
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    currentBranch,
    activeTimers,
    startTimer,
    stopTimer,
  } = useWorkshop();

  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "inspection" | "parts">("orders");

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch(`/api/work-orders?branchId=${currentBranch?.id || ""}`);
        if (res.ok) {
          const data = await res.json();
          const active = data.filter((w: any) => !["DELIVERED", "CANCELLED"].includes(w.status));
          setWorkOrders(active);
          if (active.length > 0 && !selectedWorkOrder) {
            setSelectedWorkOrder(active[0]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadOrders();
  }, [currentBranch]);

  const mechanics = availableUsers.filter((u) => u.role === "MECHANIC" || u.role === "ADMIN");

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const isTimerRunningForOrder = (woId: string) => {
    return activeTimers.some((t) => t.workOrderId === woId);
  };

  const getTimerForOrder = (woId: string) => {
    return activeTimers.find((t) => t.workOrderId === woId);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedWorkOrder) return;
    try {
      const res = await fetch(`/api/work-orders/${selectedWorkOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedWorkOrder(updated);
        setWorkOrders((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Tablet Top Controls */}
      <div className="glass-panel rounded-3xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-black text-amber-400">Műhely Érintőképernyős Mód</div>
            <h1 className="text-xl font-black text-white">Szerelői Munkaállomás</h1>
          </div>
        </div>

        {/* Quick Mechanic PIN Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <span className="text-xs text-slate-400 pl-2 font-semibold">Szerelő:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = availableUsers.find((x) => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none cursor-pointer"
            >
              {mechanics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.pinCode ? `PIN: ${m.pinCode}` : m.role})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setQrModalOpen(true)}
            className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-xs font-bold text-slate-100 flex items-center gap-2 shadow-md hover:scale-105 transition"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>QR Kód Beolvasás</span>
          </button>
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Work Orders List */}
        <div className="glass-panel rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-sm text-white">Aktív Munkák ({workOrders.length})</span>
            <span className="text-[11px] text-slate-400 font-medium">Érintse meg a kiválasztáshoz!</span>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {workOrders.map((wo) => {
              const isSelected = selectedWorkOrder?.id === wo.id;
              const running = isTimerRunningForOrder(wo.id);
              const timer = getTimerForOrder(wo.id);

              return (
                <div
                  key={wo.id}
                  onClick={() => setSelectedWorkOrder(wo)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 transform ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-950/80 to-slate-900 border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.01]"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-black text-sm text-blue-400">
                      {wo.vehicle?.licensePlate || "NINCS RENDSZÁM"}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {wo.orderNumber}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-200 truncate">
                    {wo.vehicle?.brand} {wo.vehicle?.model}
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {wo.issueDescription}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-850 text-slate-300 font-bold">
                      {wo.status}
                    </span>

                    {running && timer ? (
                      <span className="text-xs font-mono font-black text-amber-400 flex items-center gap-1.5 animate-pulse bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        {formatTimer(timer.elapsedSeconds)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {wo.actualHours ? `${wo.actualHours} óra rögzítve` : "Stopper áll"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Big Tablet Actions */}
        <div className="lg:col-span-2 space-y-6">
          {selectedWorkOrder ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Header with big Stopwatch button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white font-mono">
                      {selectedWorkOrder.vehicle?.licensePlate}
                    </h2>
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full">
                      {selectedWorkOrder.vehicle?.brand} {selectedWorkOrder.vehicle?.model}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1.5">
                    Munkalap: <span className="text-blue-400 font-mono font-bold">{selectedWorkOrder.orderNumber}</span> • Ügyfél: <span className="text-slate-200 font-semibold">{selectedWorkOrder.customer?.name} ({selectedWorkOrder.customer?.phone})</span>
                  </div>
                </div>

                {isFeatureEnabled("time_tracking") && (
                  <div>
                    {isTimerRunningForOrder(selectedWorkOrder.id) ? (
                      <button
                        onClick={() => stopTimer(selectedWorkOrder.id)}
                        className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl text-sm flex items-center gap-2.5 shadow-2xl shadow-red-600/40 hover:scale-105 transition-all animate-pulse"
                      >
                        <Square className="w-5 h-5 fill-current" />
                        <span>Stopper LEÁLLÍTÁSA</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          startTimer(
                            selectedWorkOrder.id,
                            selectedWorkOrder.orderNumber,
                            selectedWorkOrder.vehicle?.licensePlate
                          )
                        }
                        className="btn-gradient-emerald px-6 py-3.5 text-white font-black rounded-2xl text-sm flex items-center gap-2.5 shadow-2xl shadow-emerald-600/40 hover:scale-105 transition-all"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        <span>Munka INDÍTÁSA (Stopper)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Big Status Touch Tiles */}
              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2.5">
                  Munkalap Státusz Módosítása (Egyetlen érintéssel):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("DIAGNOSTICS")}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      selectedWorkOrder.status === "DIAGNOSTICS"
                        ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 scale-102"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    🔍 Diagnosztika
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      selectedWorkOrder.status === "IN_PROGRESS"
                        ? "bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/30 scale-102"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    🔧 Javítás alatt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("PARTS_WAITING")}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      selectedWorkOrder.status === "PARTS_WAITING"
                        ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 scale-102"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    📦 Alkatrészre vár
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("READY")}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      selectedWorkOrder.status === "READY"
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30 scale-102"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    ✅ Kész / Átadható
                  </button>
                </div>
              </div>

              {/* Tablet Tab Switcher */}
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                    activeTab === "orders" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Hibaleírás & Diagnózis</span>
                </button>
                {isFeatureEnabled("inspections") && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("inspection")}
                    className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                      activeTab === "inspection" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Állapotfelmérés & Sérüléstérkép</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Details */}
              {activeTab === "orders" && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">Ügyfél által jelzett hiba:</span>
                    <p className="text-slate-200 text-sm font-semibold leading-relaxed">
                      {selectedWorkOrder.issueDescription}
                    </p>
                  </div>

                  {selectedWorkOrder.publicNotes && (
                    <div className="bg-emerald-950/25 border border-emerald-800/40 p-4 rounded-2xl text-slate-300 space-y-1">
                      <span className="font-bold text-emerald-400 block text-[11px]">Elvégzendő feladatok / Szervizjegyzetek:</span>
                      <p>{selectedWorkOrder.publicNotes}</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Link
                      href={`/work-orders/${selectedWorkOrder.id}`}
                      className="btn-gradient-primary px-6 py-3 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
                    >
                      <span>Teljes Munkalap és Raktári Alkatrészek Megnyitása</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab 2: Inspection */}
              {activeTab === "inspection" && isFeatureEnabled("inspections") && (
                <div className="space-y-4">
                  <CarInspectionCanvas
                    initialPoints={[]}
                    onChange={(points) => {
                      console.log("Inspection points:", points);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-16 text-center text-slate-500 space-y-3">
              <Wrench className="w-12 h-12 mx-auto opacity-30 text-amber-400" />
              <p className="font-bold text-slate-300 text-sm">Válasszon ki egy autót a bal oldali listából a munka megkezdéséhez!</p>
            </div>
          )}
        </div>
      </div>

      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onScanSuccess={(code) => {
          const match = workOrders.find((w) => w.orderNumber === code || w.vehicle?.licensePlate === code);
          if (match) setSelectedWorkOrder(match);
          else alert(`Beolvasva: ${code}`);
        }}
      />
    </div>
  );
}
