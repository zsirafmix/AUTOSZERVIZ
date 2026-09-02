"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  Wrench,
  Car,
  User,
  Clock,
  Package,
  Plus,
  Trash2,
  Receipt,
  CheckCircle2,
  FileText,
  Printer,
  Share2,
  Sparkles,
  Play,
  Square,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2
} from "lucide-react";
import QRCodeBadge from "@/components/QRCodeBadge";
import CarInspectionCanvas from "@/components/CarInspectionCanvas";
import AIAssistantModal from "@/components/AIAssistantModal";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = params.id as string;

  const { isFeatureEnabled } = useFeatureFlags();
  const { currentUser, currentBranch, activeTimers, startTimer, stopTimer, addNotification } = useWorkshop();

  const [workOrder, setWorkOrder] = useState<any>(null);
  const [partsList, setPartsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // New item form
  const [itemType, setItemType] = useState<"LABOR" | "PART">("LABOR");
  const [itemName, setItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemUnitPriceNet, setItemUnitPriceNet] = useState("15000");
  const [selectedPartId, setSelectedPartId] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"items" | "inspection" | "quote" | "invoice">("items");

  const loadWorkOrder = async () => {
    try {
      const [woRes, pRes] = await Promise.all([
        fetch(`/api/work-orders/${workOrderId}`),
        fetch(`/api/inventory`),
      ]);
      if (woRes.ok) setWorkOrder(await woRes.json());
      if (pRes.ok) setPartsList(await pRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkOrder();
  }, [workOrderId]);

  if (loading || !workOrder) {
    return <div className="p-12 text-center text-slate-400">Munkalap betöltése folyamatban...</div>;
  }

  const isTimerRunning = activeTimers.some((t) => t.workOrderId === workOrderId);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/work-orders/${workOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setWorkOrder(await res.json());
        addNotification(`Munkalap státusza módosítva: ${newStatus}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;

    try {
      const res = await fetch(`/api/work-orders/${workOrderId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: itemType,
          name: itemName,
          itemCode: itemCode || null,
          quantity: Number(itemQty),
          unitPriceNet: Number(itemUnitPriceNet),
          partId: selectedPartId || null,
        }),
      });
      if (res.ok) {
        setItemName("");
        setItemCode("");
        setItemQty("1");
        setSelectedPartId("");
        loadWorkOrder();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Biztosan törölni szeretné ezt a tételt?")) return;
    try {
      const res = await fetch(`/api/work-orders/${workOrderId}/items?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) loadWorkOrder();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workOrderId: workOrder.id,
          customerId: workOrder.customerId,
          totalNet: workOrder.totalNet,
          totalVat: workOrder.totalVat,
          totalGross: workOrder.totalGross,
          items: workOrder.items.map((it: any) => ({
            name: it.name,
            qty: it.quantity,
            unit: it.unit,
            net: it.quantity * it.unitPriceNet,
            gross: it.totalGross,
          })),
        }),
      });
      if (res.ok) {
        alert("Számla sikeresen kiállítva és lezárva!");
        loadWorkOrder();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const publicQuoteUrl = typeof window !== "undefined" ? `${window.location.origin}/quote/${workOrder.trackingToken}` : "";
  const publicTrackingUrl = typeof window !== "undefined" ? `${window.location.origin}/track/${workOrder.trackingToken}` : "";

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-black text-white font-mono">
              {workOrder.orderNumber}
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold font-mono">
              {workOrder.vehicle?.licensePlate}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold">
              {workOrder.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Jármű: <span className="text-slate-200 font-semibold">{workOrder.vehicle?.brand} {workOrder.vehicle?.model} ({workOrder.vehicle?.year})</span> • Ügyfél: <span className="text-slate-200 font-semibold">{workOrder.customer?.name} ({workOrder.customer?.phone})</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isFeatureEnabled("time_tracking") && (
            <div>
              {isTimerRunning ? (
                <button
                  onClick={() => stopTimer(workOrderId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md animate-pulse"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stopper Leállítás</span>
                </button>
              ) : (
                <button
                  onClick={() =>
                    startTimer(workOrderId, workOrder.orderNumber, workOrder.vehicle?.licensePlate)
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Stopper Indítás</span>
                </button>
              )}
            </div>
          )}

          {isFeatureEnabled("ai_assistant") && (
            <button
              onClick={() => setAiModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 hover:text-white text-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Diagnózis</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Nyomtatás</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Work Order Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Progression Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <label className="block text-xs font-bold text-slate-400 mb-2">Szerviz Státusz Módosítása:</label>
            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
              {[
                { key: "CHECK_IN", label: "1. Bejelentkezett" },
                { key: "DIAGNOSTICS", label: "2. Diagnosztika" },
                { key: "QUOTE_PENDING", label: "3. Árajánlat készítés" },
                { key: "IN_PROGRESS", label: "4. Javítás alatt" },
                { key: "PARTS_WAITING", label: "5. Alkatrészre vár" },
                { key: "READY", label: "6. Kész" },
                { key: "DELIVERED", label: "7. Átadva" },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleStatusChange(s.key)}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    workOrder.status === s.key
                      ? "bg-blue-600 text-white border-blue-400 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "items" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Munkatételek & Alkatrészek ({workOrder.items?.length || 0})</span>
            </button>
            {isFeatureEnabled("inspections") && (
              <button
                onClick={() => setActiveTab("inspection")}
                className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "inspection" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Állapotfelmérés</span>
              </button>
            )}
            {isFeatureEnabled("quotes") && (
              <button
                onClick={() => setActiveTab("quote")}
                className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "quote" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Árajánlat & Ügyfél Jóváhagyás</span>
              </button>
            )}
          </div>

          {/* TAB 1: ITEMS */}
          {activeTab === "items" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 uppercase text-[10px] bg-slate-950/80">
                    <tr>
                      <th className="p-3 rounded-l-lg">Típus</th>
                      <th className="p-3">Megnevezés & Cikkszám</th>
                      <th className="p-3 text-right">Mennyiség</th>
                      <th className="p-3 text-right">Egységár (Nettó)</th>
                      <th className="p-3 text-right">Bruttó érték</th>
                      <th className="p-3 text-right rounded-r-lg">Művelet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {workOrder.items && workOrder.items.length > 0 ? (
                      workOrder.items.map((it: any) => (
                        <tr key={it.id} className="hover:bg-slate-800/30">
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              it.type === "LABOR" ? "bg-blue-500/20 text-blue-300" : "bg-purple-500/20 text-purple-300"
                            }`}>
                              {it.type === "LABOR" ? "MUNKADÍJ" : "ALKATRÉSZ"}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-200">
                            <div>{it.name}</div>
                            {it.itemCode && <div className="text-[10px] font-mono text-slate-500">{it.itemCode}</div>}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-300">
                            {it.quantity} {it.unit}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-300">
                            {it.unitPriceNet.toLocaleString()} Ft
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            {it.totalGross.toLocaleString()} Ft
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(it.id)}
                              className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          Még nincsenek tételek felvéve erre a munkalapra.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add New Item Form */}
              <form onSubmit={handleAddItem} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-slate-200 block">+ Új Munkadíj vagy Alkatrész Hozzáadása:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Típus</label>
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="LABOR">Munkadíj</option>
                      <option value="PART">Alkatrész (Raktárból)</option>
                    </select>
                  </div>

                  {itemType === "PART" ? (
                    <div className="md:col-span-2">
                      <label className="block text-slate-400 mb-1">Alkatrész kiválasztása raktárból</label>
                      <select
                        value={selectedPartId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          setSelectedPartId(pId);
                          const p = partsList.find((x) => x.id === pId);
                          if (p) {
                            setItemName(p.name);
                            setItemCode(p.partNumber);
                            setItemUnitPriceNet(String(p.sellingPriceNet));
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      >
                        <option value="">-- Válasszon alkatrészt --</option>
                        {partsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.partNumber}) - Készlet: {p.stockQuantity} db - {p.sellingPriceNet} Ft
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="md:col-span-2">
                      <label className="block text-slate-400 mb-1">Művelet megnevezése</label>
                      <input
                        type="text"
                        required
                        placeholder="Pl. Első fék komplett csere"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-400 mb-1">Mennyiség (óra/db)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Egységár (Nettó Ft)</label>
                    <input
                      type="number"
                      value={itemUnitPriceNet}
                      onChange={(e) => setItemUnitPriceNet(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tétel Mentése</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: INSPECTION */}
          {activeTab === "inspection" && isFeatureEnabled("inspections") && (
            <div className="space-y-4">
              <CarInspectionCanvas
                initialPoints={[]}
                onChange={(p) => console.log(p)}
              />
            </div>
          )}

          {/* TAB 3: QUOTATION & APPROVAL */}
          {activeTab === "quote" && isFeatureEnabled("quotes") && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                Online Árajánlat & Ügyfél-Jóváhagyási Rendszer
              </h3>
              <p className="text-slate-400">
                Küldje el ezt az egyedi linket SMS-ben vagy e-mailben az ügyfélnek, ahol 1 kattintással jóváhagyhatja vagy elutasíthatja az árajánlatot.
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="font-mono text-blue-400 truncate pr-2">
                  {publicQuoteUrl}
                </span>
                <a
                  href={publicQuoteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shrink-0 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Megnyitás</span>
                </a>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Jóváhagyási státusz:</span>
                <span className="font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  {workOrder.quoteStatus} {workOrder.quoteAcceptedBy ? `(${workOrder.quoteAcceptedBy})` : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Financial Totals, Live Tracking & QR */}
        <div className="space-y-6">
          {/* Financial Summary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Pénzügyi Összesítő
            </h3>

            <div className="flex justify-between text-slate-400">
              <span>Munkadíj (Nettó):</span>
              <span className="font-mono font-bold text-slate-200">{workOrder.laborCostNet.toLocaleString()} Ft</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Alkatrészek (Nettó):</span>
              <span className="font-mono font-bold text-slate-200">{workOrder.partsCostNet.toLocaleString()} Ft</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Összes Nettó:</span>
              <span className="font-mono font-bold text-slate-200">{workOrder.totalNet.toLocaleString()} Ft</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>ÁFA (27%):</span>
              <span className="font-mono text-slate-300">{workOrder.totalVat.toLocaleString()} Ft</span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-black">
              <span className="text-white">Fizetendő Bruttó:</span>
              <span className="text-emerald-400 font-mono text-base">{workOrder.totalGross.toLocaleString()} Ft</span>
            </div>

            {isFeatureEnabled("invoicing") && (
              <button
                type="button"
                onClick={handleGenerateInvoice}
                className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>1-Kattintásos Számlázás & Lezárás</span>
              </button>
            )}
          </div>

          {/* QR Code & Live Tracking Link */}
          {isFeatureEnabled("live_tracking") && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-center space-y-3">
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                Munkalap & Élő Követő QR-kód
              </h3>
              <div className="flex justify-center">
                <QRCodeBadge
                  value={publicTrackingUrl}
                  label={workOrder.orderNumber}
                  size={130}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                A szerelő telefonnal beolvasva azonnal megnyithatja ezt a munkalapot a műhelyben.
              </p>
              <a
                href={publicTrackingUrl}
                target="_blank"
                rel="noreferrer"
                className="block py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-xl text-xs transition border border-slate-700"
              >
                Élő Ügyfél Státuszkövető Megnyitása ➔
              </a>
            </div>
          )}
        </div>
      </div>

      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        initialNotes={workOrder.issueDescription}
        vehiclePlate={workOrder.vehicle?.licensePlate}
        onApplyDiagnosis={(diag) => {
          console.log(diag);
        }}
      />
    </div>
  );
}
