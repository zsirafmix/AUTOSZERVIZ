"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Car,
  BookOpen,
  Calendar,
  Receipt,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  UserCircle
} from "lucide-react";

export default function CustomerPortalPage() {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/customers");
        if (res.ok) {
          const list = await res.json();
          if (list.length > 0) setCustomer(list[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !customer) {
    return <div className="p-12 text-center text-slate-400">Ügyfélfiók betöltése...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Portal Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-700/50 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-white shadow-lg">
            <UserCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Prémium Ügyfél Portál
            </div>
            <h1 className="text-2xl font-black text-white">
              Üdvözöljük, {customer.name}!
            </h1>
            <p className="text-xs text-blue-200">
              Saját gépjárművei, digitális szervizkönyve, számlái és élő szervizállapotai.
            </p>
          </div>
        </div>

        <Link
          href="/calendar"
          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/30 transition"
        >
          <Calendar className="w-4 h-4" />
          <span>Új Időpont Foglalása</span>
        </Link>
      </div>

      {/* Customer Vehicles Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-400" />
          Gépjárműveim & Digitális Szervizkönyv
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customer.vehicles?.map((v: any) => (
            <div
              key={v.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="font-mono font-black text-lg text-blue-400">
                    {v.licensePlate}
                  </span>
                  <div className="text-slate-200 font-bold mt-0.5">
                    {v.brand} {v.model} ({v.year})
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 font-mono font-bold">
                  {v.mileage?.toLocaleString()} km
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>VIN: <span className="text-white font-mono font-bold">{v.vin || "N/A"}</span></div>
                <div>Üzemanyag: <span className="text-white font-medium">{v.fuelType}</span></div>
                <div>Következő műszaki: <span className="text-emerald-400 font-bold font-mono">2026.11.15</span></div>
                <div>Szerviz periódus: <span className="text-blue-400 font-bold">15.000 km / 1 év</span></div>
              </div>

              {/* Service History Summary */}
              <div>
                <span className="font-bold text-slate-300 block mb-1.5">Legutóbbi Szervizek:</span>
                <div className="space-y-1.5">
                  {v.workOrders && v.workOrders.length > 0 ? (
                    v.workOrders.map((wo: any) => (
                      <div
                        key={wo.id}
                        className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{wo.orderNumber}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{wo.issueDescription}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                          {wo.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 italic">Még nincs szerviztörténet</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
