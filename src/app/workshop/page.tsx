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
  Layers
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
  const [mechanicPin, setMechanicPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "inspection" | "parts">("orders");

  // Load active work orders
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch(`/api/work-orders?branchId=${currentBranch?.id || ""}`);
        if (res.ok) {
          const data = await res.json();
          // Filter to non-delivered
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
    <div className="space-y-4">
      {/* Tablet Top Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400">Műhely Érintőképernyős Mód</div>
            <h1 className="text-lg font-black text-white">Szerelői Munkaállomás</h1>
          </div>
        </div>

        {/* Quick Mechanic PIN Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 pl-2 font-medium">Szerelő:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = availableUsers.find((x) => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 font-bold focus:outline-none"
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
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>QR Munkalap</span>
          </button>
        </div>
      </div>

      {/* Split View: Left List of Work Orders, Right Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Side: Work Orders List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-sm text-slate-200">Aktív Munkák ({workOrders.length})</span>
            <span className="text-[11px] text-slate-400">Válasszon autót!</span>
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {workOrders.map((wo) => {
              const isSelected = selectedWorkOrder?.id === wo.id;
              const running = isTimerRunningForOrder(wo.id);
              const timer = getTimerForOrder(wo.id);

              return (
                <div
                  key={wo.id}
                  onClick={() => setSelectedWorkOrder(wo)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition transform ${
                    isSelected
                      ? "bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/10"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-black text-sm text-blue-400">
                      {wo.vehicle?.licensePlate || "NINCS RENDSZÁM"}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {wo.orderNumber}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {wo.vehicle?.brand} {wo.vehicle?.model}
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {wo.issueDescription}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {wo.status}
                    </span>

                    {running && timer ? (
                      <span className="text-xs font-mono font-black text-amber-400 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" />
                        {formatTimer(timer.elapsedSeconds)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
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
        <div className="lg:col-span-2 space-y-4">
          {selectedWorkOrder ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              {/* Selected Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white font-mono">
                      {selectedWorkOrder.vehicle?.licensePlate}
                    </h2>
                    <span className="text-xs font-bold text-slate-400">
                      ({selectedWorkOrder.vehicle?.brand} {selectedWorkOrder.vehicle?.model} - {selectedWorkOrder.vehicle?.year})
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Munkalap: <span className="text-blue-400 font-mono font-bold">{selectedWorkOrder.orderNumber}</span> • Ügyfél: <span className="text-slate-200">{selectedWorkOrder.customer?.name} ({selectedWorkOrder.customer?.phone})</span>
                  </div>
                </div>

                {/* Big Start / Stop Button */}
                {isFeatureEnabled("time_tracking") && (
                  <div>
                    {isTimerRunningForOrder(selectedWorkOrder.id) ? (
                      <button
                        onClick={() => stopTimer(selectedWorkOrder.id)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition transform hover:scale-105 animate-pulse"
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
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:scale-105"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        <span>Munka INDÍTÁSA (Stopper)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Big Status Buttons for Mechanics */}
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-2">
                  Munkalap Státusz Gyorsváltó:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("DIAGNOSTICS")}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedWorkOrder.status === "DIAGNOSTICS"
                        ? "bg-blue-600 text-white border-blue-400 shadow-md"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    🔍 Diagnosztika
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedWorkOrder.status === "IN_PROGRESS"
                        ? "bg-amber-600 text-white border-amber-400 shadow-md"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    🔧 Javítás alatt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("PARTS_WAITING")}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedWorkOrder.status === "PARTS_WAITING"
                        ? "bg-purple-600 text-white border-purple-400 shadow-md"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    📦 Alkatrészre vár
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("READY")}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedWorkOrder.status === "READY"
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    ✅ Kész / Átadható
                  </button>
                </div>
              </div>

              {/* Tablet Tab Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === "orders" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Hibaleírás & Műveletek</span>
                </button>
                {isFeatureEnabled("inspections") && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("inspection")}
                    className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                      activeTab === "inspection" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Állapotfelmérés & Sérüléstérkép</span>
                  </button>
                )}
              </div>

              {/* TAB 1: Work Order Details */}
              {activeTab === "orders" && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-300 block">Ügyfél által jelzett hibajelenség:</span>
                    <p className="text-slate-200 text-sm font-medium leading-relaxed">
                      {selectedWorkOrder.issueDescription}
                    </p>
                  </div>

                  {selectedWorkOrder.publicNotes && (
                    <div className="bg-emerald-950/20 border border-emerald-800/40 p-3.5 rounded-xl text-slate-300">
                      <span className="font-bold text-emerald-400 block mb-1">Elvégzendő feladatok / Diagnózis:</span>
                      {selectedWorkOrder.publicNotes}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Link
                      href={`/work-orders/${selectedWorkOrder.id}`}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <span>Teljes Munkalap és Raktár Megnyitása</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 2: Interactive Inspection */}
              {activeTab === "inspection" && isFeatureEnabled("inspections") && (
                <div className="space-y-3">
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-slate-300">Válasszon ki egy autót a bal oldali listából!</p>
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
