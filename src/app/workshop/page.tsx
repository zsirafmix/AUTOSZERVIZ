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
  QrCode,
  FileCheck,
  AlertCircle,
  Plus,
  Package,
  ChevronRight
} from "lucide-react";
import QRScannerModal from "@/components/QRScannerModal";
import CarInspectionCanvas from "@/components/CarInspectionCanvas";

export default function WorkshopMetroPage() {
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
  const [activeTab, setActiveTab] = useState<"orders" | "inspection">("orders");

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
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
      {/* Tablet Top Control Bar */}
      <div className="bg-orange-600 text-white p-6 rounded-3xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black/20 rounded-2xl">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <div>
            <span className="px-3 py-1 bg-black/30 rounded-lg text-xs font-black uppercase tracking-wider">
              Műhely Érintőképernyő
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Szerelői Munkaállomás
            </h1>
          </div>
        </div>

        {/* Mechanic Quick Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/30 p-2 rounded-2xl border border-white/20">
            <span className="text-sm font-bold pl-2">Szerelő:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = availableUsers.find((x) => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="bg-slate-900 border-2 border-white/40 text-white text-base rounded-xl px-4 py-2 font-black cursor-pointer"
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
            className="px-5 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm flex items-center gap-2 border-2 border-white/40 shadow-lg"
          >
            <QrCode className="w-5 h-5 text-amber-400" />
            <span>QR Olvasó</span>
          </button>
        </div>
      </div>

      {/* Main Tablet Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Work Orders List */}
        <div className="bg-slate-850 border-2 border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-700">
            <h3 className="font-black text-xl text-white">Munkák a Műhelyben ({workOrders.length})</h3>
            <Link href="/reception" className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-black uppercase">
              + Új Autó
            </Link>
          </div>

          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {workOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold">
                Nincs jelenleg aktív munka a műhelyben.
                <div className="mt-4">
                  <Link href="/reception" className="btn-metro-green text-sm py-3 px-6">
                    + Munkalap Felvétele
                  </Link>
                </div>
              </div>
            ) : (
              workOrders.map((wo) => {
                const isSelected = selectedWorkOrder?.id === wo.id;
                const running = isTimerRunningForOrder(wo.id);
                const timer = getTimerForOrder(wo.id);

                return (
                  <div
                    key={wo.id}
                    onClick={() => setSelectedWorkOrder(wo)}
                    className={`metro-tile p-5 rounded-2xl border-2 transition ${
                      isSelected
                        ? "bg-blue-600 border-white text-white shadow-2xl scale-[1.02]"
                        : "bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xl text-yellow-300">
                        {wo.vehicle?.licensePlate || "NINCS RENDSZÁM"}
                      </span>
                      <span className="text-xs px-2.5 py-1 bg-black/40 rounded-lg font-mono font-bold">
                        {wo.orderNumber}
                      </span>
                    </div>

                    <div className="text-base font-bold mt-1">
                      {wo.vehicle?.brand} {wo.vehicle?.model}
                    </div>

                    <div className="text-sm opacity-90 line-clamp-2 mt-1">
                      {wo.issueDescription}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                      <span className="text-xs px-3 py-1 bg-black/30 rounded-lg font-black uppercase">
                        {wo.status}
                      </span>

                      {running && timer ? (
                        <span className="text-base font-mono font-black text-yellow-300 flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-4 h-4" />
                          {formatTimer(timer.elapsedSeconds)}
                        </span>
                      ) : (
                        <span className="text-xs opacity-75 font-mono">
                          {wo.actualHours ? `${wo.actualHours} óra rögzítve` : "Stopper áll"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Work Order Details & Giant Action Tiles */}
        <div className="lg:col-span-2 space-y-6">
          {selectedWorkOrder ? (
            <div className="bg-slate-850 border-2 border-slate-700 rounded-3xl p-7 shadow-2xl space-y-6">
              {/* Header with big Stopwatch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-700 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-yellow-300 font-mono tracking-wider">
                      {selectedWorkOrder.vehicle?.licensePlate}
                    </h2>
                    <span className="text-sm font-bold bg-slate-700 px-3 py-1 rounded-xl text-white">
                      {selectedWorkOrder.vehicle?.brand} {selectedWorkOrder.vehicle?.model}
                    </span>
                  </div>
                  <div className="text-sm text-slate-300 mt-1 font-semibold">
                    Munkalap: <span className="text-blue-400 font-mono font-bold">{selectedWorkOrder.orderNumber}</span> • Ügyfél: <span className="text-white font-bold">{selectedWorkOrder.customer?.name} ({selectedWorkOrder.customer?.phone})</span>
                  </div>
                </div>

                {isFeatureEnabled("time_tracking") && (
                  <div>
                    {isTimerRunningForOrder(selectedWorkOrder.id) ? (
                      <button
                        onClick={() => stopTimer(selectedWorkOrder.id)}
                        className="metro-tile bg-red-600 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-pulse border-2 border-white"
                      >
                        <Square className="w-6 h-6 fill-current" />
                        <span>STOPPER LEÁLLÍTÁSA</span>
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
                        className="btn-metro-green text-lg px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3 border-2 border-emerald-400"
                      >
                        <Play className="w-6 h-6 fill-current" />
                        <span>MUNKA INDÍTÁSA (STOPPER)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Giant Status Tiles */}
              <div>
                <label className="block text-sm text-slate-300 font-black uppercase tracking-wider mb-3">
                  Munkalap Státusz Módosítása (Egyetlen érintéssel):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-base font-black">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("DIAGNOSTICS")}
                    className={`metro-tile p-5 rounded-2xl border-2 text-center transition ${
                      selectedWorkOrder.status === "DIAGNOSTICS"
                        ? "bg-blue-600 text-white border-white shadow-xl scale-102"
                        : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    🔍 DIAGNOSZTIKA
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    className={`metro-tile p-5 rounded-2xl border-2 text-center transition ${
                      selectedWorkOrder.status === "IN_PROGRESS"
                        ? "bg-orange-600 text-white border-white shadow-xl scale-102"
                        : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    🔧 JAVÍTÁS ALATT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("PARTS_WAITING")}
                    className={`metro-tile p-5 rounded-2xl border-2 text-center transition ${
                      selectedWorkOrder.status === "PARTS_WAITING"
                        ? "bg-purple-600 text-white border-white shadow-xl scale-102"
                        : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    📦 ALKATRÉSZRE VÁR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("READY")}
                    className={`metro-tile p-5 rounded-2xl border-2 text-center transition ${
                      selectedWorkOrder.status === "READY"
                        ? "bg-emerald-600 text-white border-white shadow-xl scale-102"
                        : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    ✅ KÉSZ / ÁTADHATÓ
                  </button>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-slate-900 p-2 rounded-2xl border-2 border-slate-700 text-base font-black">
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`flex-1 py-3 rounded-xl transition flex items-center justify-center gap-2 ${
                    activeTab === "orders" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileCheck className="w-5 h-5" />
                  <span>Hibaleírás & Feladatok</span>
                </button>
                {isFeatureEnabled("inspections") && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("inspection")}
                    className={`flex-1 py-3 rounded-xl transition flex items-center justify-center gap-2 ${
                      activeTab === "inspection" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>Állapotfelmérés & Sérüléstérkép</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Orders */}
              {activeTab === "orders" && (
                <div className="space-y-5 text-base">
                  <div className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-700 space-y-2">
                    <span className="font-black text-slate-400 block uppercase tracking-wider text-xs">Ügyfél által jelzett panasz:</span>
                    <p className="text-white text-lg font-bold leading-relaxed">
                      {selectedWorkOrder.issueDescription}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Link
                      href={`/work-orders/${selectedWorkOrder.id}`}
                      className="btn-metro-primary text-base py-4 px-8 rounded-xl"
                    >
                      <span>Teljes Munkalap és Raktári Alkatrészek Megnyitása</span>
                      <ChevronRight className="w-5 h-5" />
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
            <div className="bg-slate-850 border-2 border-slate-700 rounded-3xl p-16 text-center text-slate-400 space-y-4">
              <Wrench className="w-16 h-16 mx-auto opacity-30 text-amber-400" />
              <p className="font-black text-white text-xl">Válasszon ki egy autót a bal oldali listából a munka megkezdéséhez!</p>
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
