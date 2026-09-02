"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  Car,
  Clock,
  ArrowRight,
  Sparkles,
  QrCode
} from "lucide-react";

export default function WorkOrdersPage() {
  const { currentBranch } = useWorkshop();
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/work-orders?branchId=${currentBranch?.id || ""}`);
        if (res.ok) {
          setWorkOrders(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentBranch]);

  const columns = [
    { key: "CHECK_IN", label: "Bejelentkezett", color: "border-blue-500 text-blue-400 bg-blue-500/10" },
    { key: "DIAGNOSTICS", label: "Diagnosztika", color: "border-indigo-500 text-indigo-400 bg-indigo-500/10" },
    { key: "QUOTE_PENDING", label: "Árajánlatra vár", color: "border-purple-500 text-purple-400 bg-purple-500/10" },
    { key: "PARTS_WAITING", label: "Alkatrészre vár", color: "border-amber-500 text-amber-400 bg-amber-500/10" },
    { key: "IN_PROGRESS", label: "Javítás alatt", color: "border-orange-500 text-orange-400 bg-orange-500/10" },
    { key: "READY", label: "Kész / Átadásra vár", color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
    { key: "DELIVERED", label: "Átadva & Lezárva", color: "border-slate-600 text-slate-400 bg-slate-800/40" },
  ];

  const filteredOrders = workOrders.filter((w) => {
    const matchSearch =
      search === "" ||
      w.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      w.vehicle?.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      w.customer?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-blue-400" />
            Munkalapkezelés & Műhely Munkafolyamat
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Átlátható Kanban folyamattábla és részletes munkalap lista szervizfázisok szerint.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-lg transition ${
                viewMode === "kanban" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
              title="Kanban nézet"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition ${
                viewMode === "table" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
              title="Táblázat nézet"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/reception"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Új Munkalap</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2 w-full sm:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Keresés rendszám, munkalapszám, ügyfél..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Státusz szűrő:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="ALL">Összes státusz ({workOrders.length})</option>
            {columns.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label} ({workOrders.filter((w) => w.status === c.key).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3.5 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colOrders = filteredOrders.filter((w) => w.status === col.key);

            return (
              <div
                key={col.key}
                className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col min-w-[250px] shadow-lg"
              >
                {/* Column Header */}
                <div className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between font-bold text-xs ${col.color}`}>
                  <span>{col.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-white text-[10px] font-mono">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards in Column */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[72vh] pr-0.5">
                  {colOrders.map((wo) => (
                    <Link
                      key={wo.id}
                      href={`/work-orders/${wo.id}`}
                      className="block bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/80 rounded-xl p-3 text-xs transition transform hover:-translate-y-0.5 shadow-md group"
                    >
                      <div className="flex items-center justify-between font-mono font-bold mb-1.5">
                        <span className="text-blue-400 group-hover:text-blue-300">
                          {wo.vehicle?.licensePlate || "NINCS RENDSZÁM"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {wo.orderNumber}
                        </span>
                      </div>

                      <div className="font-bold text-slate-200 truncate">
                        {wo.vehicle?.brand} {wo.vehicle?.model}
                      </div>

                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        👤 {wo.customer?.name}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                        {wo.issueDescription}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="font-mono font-bold text-slate-300">
                          {wo.totalGross ? `${wo.totalGross.toLocaleString()} Ft` : "0 Ft"}
                        </span>
                        <span className="text-slate-500 group-hover:text-blue-400 flex items-center gap-0.5 font-semibold">
                          Részletek <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}

                  {colOrders.length === 0 && (
                    <div className="text-center py-8 text-slate-600 text-[11px] border border-dashed border-slate-800/80 rounded-xl">
                      Nincs munkalap ebben a fázisban
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === "table" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase text-[10px] bg-slate-950/70">
              <tr>
                <th className="p-3 rounded-l-lg">Munkalapszám</th>
                <th className="p-3">Rendszám</th>
                <th className="p-3">Jármű</th>
                <th className="p-3">Ügyfél</th>
                <th className="p-3">Hibaleírás</th>
                <th className="p-3">Státusz</th>
                <th className="p-3">Bruttó összeg</th>
                <th className="p-3 text-right rounded-r-lg">Megnyitás</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-blue-400">{wo.orderNumber}</td>
                  <td className="p-3 font-mono font-bold text-white">{wo.vehicle?.licensePlate}</td>
                  <td className="p-3 text-slate-300">{wo.vehicle?.brand} {wo.vehicle?.model} ({wo.vehicle?.year})</td>
                  <td className="p-3 text-slate-300">{wo.customer?.name} ({wo.customer?.phone})</td>
                  <td className="p-3 text-slate-400 max-w-xs truncate">{wo.issueDescription}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                      {wo.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-200">
                    {wo.totalGross ? `${wo.totalGross.toLocaleString()} Ft` : "-"}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/work-orders/${wo.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                    >
                      Munkalap
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
