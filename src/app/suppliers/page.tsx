"use client";

import React, { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Search,
  ExternalLink,
  Package,
  Clock,
  CheckCircle2,
  Building
} from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, oRes] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/suppliers/orders"),
        ]);
        if (sRes.ok) setSuppliers(await sRes.json());
        if (oRes.ok) setOrders(await oRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-blue-400" />
            Beszállítók & Beszerzési Megrendelések
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Unix Autó, Bárdi Autó, Inter Cars partnerkapcsolatok, kedvezményszintek és beérkező rendelések.
          </p>
        </div>
      </div>

      {/* Suppliers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-400" />
                {s.name}
              </h3>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold text-[10px]">
                -{s.discountRate}% kedvezmény
              </span>
            </div>

            <div className="space-y-1 text-slate-300">
              <div>Kapcsolattartó: <span className="text-white font-medium">{s.contactPerson || "Ügyfélszolgálat"}</span></div>
              <div>Telefon: <span className="font-mono text-slate-400">{s.phone}</span></div>
              <div>E-mail: <span className="text-slate-400">{s.email}</span></div>
            </div>

            {s.website && (
              <a
                href={s.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold pt-1"
              >
                <span>Beszállítói Webshop</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h2 className="font-bold text-base text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Package className="w-5 h-5 text-blue-400" />
          Legutóbbi Beszerzési Megrendelések
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase text-[10px] bg-slate-950/70">
              <tr>
                <th className="p-3 rounded-l-lg">Rendelésszám</th>
                <th className="p-3">Beszállító</th>
                <th className="p-3">Státusz</th>
                <th className="p-3 text-right">Nettó összeg</th>
                <th className="p-3 text-right rounded-r-lg">Rendelve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-blue-400">{o.orderNumber}</td>
                    <td className="p-3 font-semibold text-white">{o.supplier?.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-200">
                      {o.totalAmountNet.toLocaleString()} Ft
                    </td>
                    <td className="p-3 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(o.orderedAt).toLocaleDateString("hu-HU")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    Nincsenek aktív beszállítói rendelések.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
