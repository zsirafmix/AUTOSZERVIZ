"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  XCircle,
  PhoneCall,
  ShieldCheck,
  Receipt,
  Car
} from "lucide-react";

export default function PublicQuotePage() {
  const params = useParams();
  const token = params.token as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signerName, setSignerName] = useState("");
  const [actionDone, setActionDone] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/quotes/${token}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          if (data.customer?.name) setSignerName(data.customer.name);
          if (data.quoteStatus === "ACCEPTED" || data.quoteStatus === "REJECTED" || data.quoteStatus === "CALL_REQUESTED") {
            setActionDone(data.quoteStatus);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const handleRespond = async (action: "ACCEPT" | "REJECT" | "CALL_REQUEST") => {
    try {
      const res = await fetch(`/api/quotes/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          signerName,
          signatureData: `Digitális jóváhagyás: ${signerName} (${new Date().toISOString()})`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionDone(data.quoteStatus);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Árajánlat betöltése...</div>;
  }

  if (!order) {
    return <div className="p-12 text-center text-red-400">Nem található árajánlat.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto my-8 space-y-6 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100">
        {/* Header */}
        <div className="text-center space-y-1.5 pb-6 border-b border-slate-800">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold font-mono">
            {order.vehicle?.licensePlate}
          </span>
          <h1 className="text-2xl font-black text-white">
            Hivatalos Szerviz Árajánlat & Jóváhagyás
          </h1>
          <p className="text-xs text-slate-400">
            Munkalap: <span className="font-mono text-slate-300 font-bold">{order.orderNumber}</span> • {order.customer?.name}
          </p>
        </div>

        {/* Issue Description */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs">
          <span className="font-bold text-slate-400">Javítási tételek leírása:</span>
          <p className="text-slate-200 font-medium leading-relaxed">
            {order.publicNotes || order.issueDescription}
          </p>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-200">Kalkulált tételek</h3>
          <div className="divide-y divide-slate-800/80 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-xs">
            {order.items?.map((it: any) => (
              <div key={it.id} className="p-3.5 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">{it.name}</div>
                  <div className="text-[10px] text-slate-400">{it.quantity} {it.unit}</div>
                </div>
                <div className="font-mono font-bold text-slate-200">
                  {it.totalGross.toLocaleString()} Ft
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Box */}
        <div className="bg-blue-950/40 border border-blue-800/50 p-5 rounded-2xl flex justify-between items-center">
          <div>
            <div className="text-xs text-blue-300 font-semibold">Fizetendő Végösszeg (Bruttó):</div>
            <div className="text-[11px] text-slate-400">(Tartalmazza a 27% ÁFÁ-t és a munkadíjat)</div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {order.totalGross.toLocaleString()} Ft
          </div>
        </div>

        {/* Feedback / Action Area */}
        {actionDone ? (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-bold text-base text-white">
              Köszönjük a visszajelzést!
            </div>
            <p className="text-xs text-slate-300">
              Státusz: <span className="font-bold text-emerald-400">{actionDone}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Jóváhagyó neve *</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-bold">
              <button
                type="button"
                onClick={() => handleRespond("ACCEPT")}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition transform hover:scale-102"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ELFOGADOM</span>
              </button>

              <button
                type="button"
                onClick={() => handleRespond("CALL_REQUEST")}
                className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>HÍVJANAK FEL</span>
              </button>

              <button
                type="button"
                onClick={() => handleRespond("REJECT")}
                className="p-3 bg-red-600/20 hover:bg-red-600 border border-red-500/40 hover:text-white text-red-300 rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>ELUTASÍTOM</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
