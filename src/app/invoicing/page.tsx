"use client";

import React, { useEffect, useState } from "react";
import {
  Receipt,
  Download,
  CreditCard,
  Banknote,
  Building,
  CheckCircle2,
  Clock,
  Printer
} from "lucide-react";

export default function InvoicingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) setInvoices(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const totalRevenue = invoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.totalGross, 0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-emerald-400" />
            Számlázás & Pénzügyi Áttekintés
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kiállított számlák, díjbekérők, kiegyenlítések és Számlázz.hu / Billingo kompatibilis modul.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right text-xs">
          <span className="text-slate-400 block text-[10px]">Összes kiegyenlített forgalom:</span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {totalRevenue.toLocaleString()} Ft
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-400 uppercase text-[10px] bg-slate-950/70">
            <tr>
              <th className="p-3 rounded-l-lg">Számlaszám</th>
              <th className="p-3">Vevő / Ügyfél</th>
              <th className="p-3">Fizetési mód</th>
              <th className="p-3">Kelt / Teljesítés</th>
              <th className="p-3">Státusz</th>
              <th className="p-3 text-right">Bruttó összeg</th>
              <th className="p-3 text-right rounded-r-lg">Művelet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-mono font-bold text-blue-400">{inv.invoiceNumber}</td>
                <td className="p-3 font-semibold text-white">{inv.customer?.name}</td>
                <td className="p-3 text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {inv.paymentMethod === "CARD" ? "Bankkártya" : inv.paymentMethod === "CASH" ? "Készpénz" : "Átutalás"}
                  </span>
                </td>
                <td className="p-3 text-slate-400 font-mono text-[11px]">
                  {new Date(inv.issueDate).toLocaleDateString("hu-HU")}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    inv.status === "PAID" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {inv.status === "PAID" ? "KIEGYENLÍTVE" : "FIZETÉSRE VÁR"}
                  </span>
                </td>
                <td className="p-3 text-right font-mono font-black text-emerald-400 text-sm">
                  {inv.totalGross.toLocaleString()} Ft
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Nyomtatás</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
