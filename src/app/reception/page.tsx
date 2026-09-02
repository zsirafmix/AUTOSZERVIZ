"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  ClipboardList,
  UserPlus,
  Car,
  Search,
  Sparkles,
  CheckCircle2,
  Wrench,
  Calendar,
  DollarSign,
  FileText,
  KeyRound,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import AIAssistantModal from "@/components/AIAssistantModal";

export default function ReceptionPage() {
  const router = useRouter();
  const { currentBranch, currentUser } = useWorkshop();
  const { isFeatureEnabled } = useFeatureFlags();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isCompany, setIsCompany] = useState(false);
  const [companyTaxNumber, setCompanyTaxNumber] = useState("");

  const [licensePlate, setLicensePlate] = useState("");
  const [vin, setVin] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2019");
  const [fuelType, setFuelType] = useState("Diesel");
  const [mileage, setMileage] = useState("145000");

  const [issueDescription, setIssueDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [estimatedHours, setEstimatedHours] = useState("2");

  const [vinLoading, setVinLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const handleVinLookup = async () => {
    if (!vin || vin.length < 5) return;
    setVinLoading(true);
    try {
      const res = await fetch("/api/vehicles/decode-vin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.brand) setBrand(data.brand);
        if (data.model) setModel(data.model);
        if (data.year) setYear(String(data.year));
        if (data.fuelType) setFuelType(data.fuelType);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVinLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !licensePlate || !issueDescription) {
      alert("Kérjük töltse ki a kötelező mezőket!");
      return;
    }

    setSubmitting(true);
    try {
      const custRes = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          isCompany,
          companyName: isCompany ? customerName : null,
          taxNumber: companyTaxNumber,
        }),
      });
      const customer = await custRes.json();

      const vehRes = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          licensePlate,
          vin,
          brand: brand || "Általános Márka",
          model: model || "Típus",
          year: Number(year),
          fuelType,
          mileage: Number(mileage),
        }),
      });
      const vehicle = await vehRes.json();

      const woRes = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: currentBranch.id,
          customerId: customer.id,
          vehicleId: vehicle.id,
          issueDescription,
          priority,
          mileageAtService: Number(mileage),
          estimatedHours: Number(estimatedHours),
          status: "CHECK_IN",
        }),
      });
      const workOrder = await woRes.json();

      router.push(`/work-orders/${workOrder.id}`);
    } catch (e) {
      console.error(e);
      alert("Hiba történt a munkalap felvételekor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
            Recepció & Munkafelvevő
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-md">
              <ClipboardList className="w-6 h-6" />
            </div>
            Gyors Járműfelvétel & Munkalap Nyitás
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            1 perces bejelentkezés: Ügyféladatok, automatikus VIN dekóderes autófelvétel és azonnali munkalap készítés.
          </p>
        </div>

        {isFeatureEnabled("ai_assistant") && (
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Hibaleírás Segéd</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Info */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
              1
            </div>
            <span>Ügyfélkapcsolati Adatok</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Ügyfél neve / Cégnév *</label>
              <input
                type="text"
                required
                placeholder="Pl. Kovács János"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Telefonszám *</label>
              <input
                type="tel"
                required
                placeholder="Pl. +36 30 123 4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">E-mail cím</label>
              <input
                type="email"
                placeholder="ugyfel@pelda.hu"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 font-semibold">
              <input
                type="checkbox"
                checked={isCompany}
                onChange={(e) => setIsCompany(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span>Céges ügyfél (Adószám rögzítése)</span>
            </label>

            {isCompany && (
              <input
                type="text"
                placeholder="Adószám: 12345678-2-42"
                value={companyTaxNumber}
                onChange={(e) => setCompanyTaxNumber(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono w-52"
              />
            )}
          </div>
        </div>

        {/* Step 2: Vehicle Info & VIN Decoder */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
              2
            </div>
            <span>Jármű Adatok & Automatikus VIN Dekóder</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Rendszám *</label>
              <input
                type="text"
                required
                placeholder="AA-BC-123"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs font-mono font-black text-blue-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none uppercase tracking-wider"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Alvázszám (VIN)</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="17 jegyű VIN"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-white focus:ring-2 focus:ring-blue-500/50 uppercase"
                />
                <button
                  type="button"
                  onClick={handleVinLookup}
                  disabled={vinLoading || !vin}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 shrink-0 shadow-md"
                >
                  {vinLoading ? "..." : "Lekérés"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Márka</label>
              <input
                type="text"
                placeholder="Pl. Volkswagen"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Modell</label>
              <input
                type="text"
                placeholder="Pl. Golf VII Variant"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Évjárat</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-blue-500/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Üzemanyag</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Diesel">Dízel</option>
                <option value="Petrol">Benzin</option>
                <option value="Hybrid">Hibrid</option>
                <option value="Electric">Elektromos</option>
                <option value="LPG">LPG / Gáz</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Aktuális km-óra állás</label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Prioritás</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white font-bold focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="NORMAL">Normál</option>
                <option value="HIGH">Sürgős (Magas)</option>
                <option value="URGENT">Azonnali (SOS)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Issue Description */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
              3
            </div>
            <span>Hibaleírás & Munkakérés</span>
          </h2>

          <div className="text-xs space-y-2">
            <label className="block text-slate-300 font-semibold">
              Ügyfél által jelzett panaszok / Elvégzendő műveletek *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Pl. Fék ráz 90 felett, jobb elölről kopogás hallható, vagy 15.000 km-es olajcsere szűrőkkel..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition leading-relaxed"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-gradient-primary px-8 py-4 text-white font-black rounded-2xl text-sm flex items-center gap-2.5 shadow-2xl shadow-blue-600/40 hover:scale-105 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{submitting ? "Munkalap rögzítése..." : "Munkalap Létrehozása & Megnyitása"}</span>
          </button>
        </div>
      </form>

      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        initialNotes={issueDescription}
        vehiclePlate={licensePlate}
        onApplyDiagnosis={(diag) => {
          setIssueDescription(diag.structuredIssue);
          if (diag.recommendedOperations.length > 0) {
            setEstimatedHours(String(diag.recommendedOperations.reduce((acc, curr) => acc + curr.estimatedHours, 0)));
          }
        }}
      />
    </div>
  );
}
