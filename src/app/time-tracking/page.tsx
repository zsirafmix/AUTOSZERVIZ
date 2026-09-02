"use client";

import React, { useEffect, useState } from "react";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  Clock,
  Play,
  Square,
  Users,
  Wrench,
  CheckCircle2,
  TrendingUp
} from "lucide-react";

export default function TimeTrackingPage() {
  const { activeTimers, stopTimer, availableUsers } = useWorkshop();

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-blue-400" />
            Munkaidő-Nyilvántartás & Szerelői Stopperóra
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Valós szerelési idők mérése Start/Stop stopperrel, tényleges vs normaidő hatékonysági mutatók.
          </p>
        </div>
      </div>

      {/* Active Timers Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
          Jelenleg Aktívan Futó Szerelői Munkák ({activeTimers.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTimers.map((t) => (
            <div
              key={t.workOrderId}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-blue-400">
                  {t.licensePlate}
                </span>
                <span className="text-slate-400 font-mono">{t.orderNumber}</span>
              </div>

              <div className="text-slate-300">
                Szerelő: <span className="font-bold text-white">{t.mechanicName}</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                <span className="text-slate-400">Eltelt idő:</span>
                <span className="text-xl font-black text-amber-400 animate-pulse">
                  {formatTimer(t.elapsedSeconds)}
                </span>
              </div>

              <button
                onClick={() => stopTimer(t.workOrderId)}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Munka Befejezése & Rögzítése</span>
              </button>
            </div>
          ))}

          {activeTimers.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-500 italic">
              Jelenleg egyetlen szerelői stopperóra sem fut.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
