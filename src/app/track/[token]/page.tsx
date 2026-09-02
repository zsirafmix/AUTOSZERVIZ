"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Car,
  Wrench,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function LiveTrackPage() {
  const params = useParams();
  const token = params.token as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/tracking/${token}`);
        if (res.ok) setOrder(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Szervizállapot betöltése...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Nem található szervizkövetési azonosító</h2>
        <p className="text-xs text-slate-400">Kérjük ellenőrizze a kapott linket!</p>
      </div>
    );
  }

  const steps = [
    { key: "CHECK_IN", label: "Autó átvéve", desc: "A jármű beérkezett a műhelybe" },
    { key: "DIAGNOSTICS", label: "Diagnosztika", desc: "Műszeres átvizsgálás folyamatban" },
    { key: "PARTS_WAITING", label: "Alkatrész beszerzés", desc: "Alkatrészek beérkezésére várunk" },
    { key: "IN_PROGRESS", label: "Javítás folyamatban", desc: "A szerelő a járművön dolgozik" },
    { key: "READY", label: "Autó elkészült!", desc: "Átvehető a szervizben" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "CHECK_IN": return 0;
      case "DIAGNOSTICS": return 1;
      case "QUOTE_PENDING": return 1;
      case "QUOTE_APPROVED": return 2;
      case "PARTS_WAITING": return 2;
      case "IN_PROGRESS": return 3;
      case "QUALITY_CHECK": return 3;
      case "READY": return 4;
      case "DELIVERED": return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);

  return (
    <div className="max-w-2xl mx-auto my-8 space-y-6 px-4">
      {/* Tracker Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100">
        {/* Header */}
        <div className="text-center space-y-1.5 pb-6 border-b border-slate-800">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold font-mono">
            {order.vehicle?.licensePlate}
          </span>
          <h1 className="text-2xl font-black text-white">
            Élő Javítási Státuszkövető
          </h1>
          <p className="text-xs text-slate-400">
            Munkalap: <span className="font-mono text-slate-300 font-bold">{order.orderNumber}</span> • {order.vehicle?.brand} {order.vehicle?.model}
          </p>
        </div>

        {/* Animated Timeline */}
        <div className="space-y-6 py-4">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex items-start gap-4 relative">
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-12 transition-colors ${
                      isCompleted ? "bg-blue-500" : "bg-slate-800"
                    }`}
                  ></div>
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition ${
                    isCompleted
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : isCurrent
                      ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse font-black"
                      : "bg-slate-950 border border-slate-800 text-slate-600"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="space-y-0.5">
                  <div className={`font-bold text-sm ${isCurrent ? "text-amber-400" : isCompleted ? "text-white" : "text-slate-500"}`}>
                    {step.label}
                    {isCurrent && <span className="ml-2 text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">FOLYAMATBAN</span>}
                  </div>
                  <div className="text-xs text-slate-400">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workshop Contact */}
        {order.branch && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>{order.branch.name}</span>
            </div>
            <div className="text-slate-400">📍 {order.branch.address}</div>
            <div className="text-blue-400 font-mono font-semibold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> {order.branch.phone}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
