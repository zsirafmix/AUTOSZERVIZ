"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  User
} from "lucide-react";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReminders = async () => {
    try {
      const res = await fetch("/api/reminders");
      if (res.ok) setReminders(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleSendReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SENT" }),
      });
      if (res.ok) {
        alert("Emlékeztető e-mail és SMS sikeresen elküldve az ügyfélnek!");
        loadReminders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-amber-400" />
            Automatikus Szervizemlékeztetők
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Olajcsere (15.000 km / 1 év), Műszaki vizsga lejárata, fékfolyadék, vezérléscsere és klímatisztítás értesítők.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.map((r) => (
          <div
            key={r.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 text-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-mono font-bold text-blue-400 text-sm">
                  {r.vehicle?.licensePlate}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  r.status === "SENT" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                }`}>
                  {r.status === "SENT" ? "KIKÜLDVE" : "FÜGGŐBEN"}
                </span>
              </div>

              <div className="font-bold text-slate-100 text-sm">
                {r.title}
              </div>

              <div className="text-slate-400 space-y-1">
                <div>👤 {r.customer?.name} ({r.customer?.phone})</div>
                <div>🚗 {r.vehicle?.brand} {r.vehicle?.model}</div>
                {r.targetDate && (
                  <div>📅 Esedékesség: <span className="font-mono font-bold text-white">{new Date(r.targetDate).toLocaleDateString("hu-HU")}</span></div>
                )}
                {r.targetMileage && (
                  <div>⚡ Esedékes km: <span className="font-mono font-bold text-white">{r.targetMileage.toLocaleString()} km</span></div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              {r.status === "PENDING" ? (
                <button
                  type="button"
                  onClick={() => handleSendReminder(r.id)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Értesítés Küldése (SMS / E-mail)</span>
                </button>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Kiküldve
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
