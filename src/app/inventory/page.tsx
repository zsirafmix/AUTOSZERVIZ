"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowDownUp,
  Tag,
  Warehouse,
  CheckCircle2
} from "lucide-react";

export default function InventoryPage() {
  const [parts, setParts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Part Form
  const [partNumber, setPartNumber] = useState("");
  const [oemNumber, setOemNumber] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fékrendszer");
  const [manufacturer, setManufacturer] = useState("Bosch");
  const [purchasePriceNet, setPurchasePriceNet] = useState("10000");
  const [sellingPriceNet, setSellingPriceNet] = useState("18000");
  const [stockQuantity, setStockQuantity] = useState("5");
  const [minStockQuantity, setMinStockQuantity] = useState("2");
  const [shelfLocation, setShelfLocation] = useState("A-01-01");

  const loadParts = async () => {
    try {
      const res = await fetch(`/api/inventory?search=${search}&lowStock=${lowStockOnly}`);
      if (res.ok) setParts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParts();
  }, [search, lowStockOnly]);

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partNumber,
          oemNumber,
          name,
          category,
          manufacturer,
          purchasePriceNet: Number(purchasePriceNet),
          sellingPriceNet: Number(sellingPriceNet),
          stockQuantity: Number(stockQuantity),
          minStockQuantity: Number(minStockQuantity),
          shelfLocation,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setPartNumber("");
        setName("");
        loadParts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Package className="w-7 h-7 text-blue-400" />
            Alkatrész- és Raktárkészlet Kezelés
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cikkszámok, polchelyek, árrések, automatikus készletlevonás munkalaphoz és minimum készletszint riasztások.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Új Cikkszám Rögzítése</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Keresés cikkszám, név, gyártó, polc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
          />
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" /> Csak alacsony készletű tételek
          </span>
        </label>
      </div>

      {/* Parts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-400 uppercase text-[10px] bg-slate-950/70">
            <tr>
              <th className="p-3 rounded-l-lg">Cikkszám / Gyári kód</th>
              <th className="p-3">Megnevezés</th>
              <th className="p-3">Gyártó / Kategória</th>
              <th className="p-3">Polchely</th>
              <th className="p-3 text-right">Beszerzési ár</th>
              <th className="p-3 text-right">Eladási ár (Nettó)</th>
              <th className="p-3 text-right">Árrés (%)</th>
              <th className="p-3 text-center rounded-r-lg">Készlet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {parts.map((p) => {
              const isLow = p.stockQuantity <= p.minStockQuantity;
              const margin = p.purchasePriceNet > 0 ? Math.round(((p.sellingPriceNet - p.purchasePriceNet) / p.purchasePriceNet) * 100) : 0;

              return (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-blue-400">
                    <div>{p.partNumber}</div>
                    {p.oemNumber && <div className="text-[10px] text-slate-500">OEM: {p.oemNumber}</div>}
                  </td>
                  <td className="p-3 font-semibold text-slate-100">
                    {p.name}
                  </td>
                  <td className="p-3 text-slate-300">
                    <div>{p.manufacturer}</div>
                    <div className="text-[10px] text-slate-500">{p.category}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-400 font-bold">
                    📍 {p.shelfLocation || "-"}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-400">
                    {p.purchasePriceNet.toLocaleString()} Ft
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-200">
                    {p.sellingPriceNet.toLocaleString()} Ft
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-400 font-bold">
                    +{margin}%
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full font-mono font-black text-xs inline-block ${
                      isLow
                        ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    }`}>
                      {p.stockQuantity} db
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: New Part */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-slate-100 text-xs space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Package className="w-5 h-5 text-blue-400" />
              Új Alkatrész Cikkszám Rögzítése
            </h2>

            <form onSubmit={handleCreatePart} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Cikkszám *</label>
                  <input
                    type="text"
                    required
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Gyári szám (OEM)</label>
                  <input
                    type="text"
                    value={oemNumber}
                    onChange={(e) => setOemNumber(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Megnevezés *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Gyártó</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Kategória</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Beszerzési ár (Nettó Ft)</label>
                  <input
                    type="number"
                    value={purchasePriceNet}
                    onChange={(e) => setPurchasePriceNet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Eladási ár (Nettó Ft)</label>
                  <input
                    type="number"
                    value={sellingPriceNet}
                    onChange={(e) => setSellingPriceNet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Kezdő készlet (db)</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Min. készletszint</label>
                  <input
                    type="number"
                    value={minStockQuantity}
                    onChange={(e) => setMinStockQuantity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Polchely</label>
                  <input
                    type="text"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md"
                >
                  Alkatrész Mentése
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
