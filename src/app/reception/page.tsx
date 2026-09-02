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
  ChevronRight,
  Plus
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
  const [year, setYear] = useState("2020");
  const [fuelType, setFuelType] = useState("Diesel");
  const [mileage, setMileage] = useState("");

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
      alert("Kérjük töltse ki a kötelező mezőket: Ügyfélnév, Telefonszám, Rendszám, Hibaleírás!");
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
          licensePlate: licensePlate.toUpperCase().trim(),
          vin: vin ? vin.toUpperCase().trim() : null,
          brand: brand || "Általános Márka",
          model: model || "Típus",
          year: Number(year),
          fuelType,
          mileage: mileage ? Number(mileage) : 0,
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
          mileageAtService: mileage ? Number(mileage) : 0,
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
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4">
      {/* Metro Header Banner */}
      <div className="bg-emerald-600 text-white p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-black/30 rounded-lg text-xs font-black uppercase tracking-wider">
            Munkafelvevő Recepció
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2 flex items-center gap-3">
            <Plus className="w-9 h-9" />
            Gyors Járműfelvétel & Új Munkalap
          </h1>
          <p className="text-base text-emerald-100 font-semibold mt-1 max-w-2xl">
            1 perces bejelentkezés: Adja meg az ügyfél és a gépjármű adatait a munkalap azonnali megnyitásához.
          </p>
        </div>

        {isFeatureEnabled("ai_assistant") && (
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2.5 shadow-xl border-2 border-emerald-400 shrink-0"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span>AI Szöveg Segéd</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Customer Data */}
        <div className="bg-slate-850 border-2 border-slate-700 rounded-3xl p-7 shadow-xl space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 pb-4 border-b-2 border-slate-700">
            <span className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-lg font-black">1</span>
            <span>Ügyfélkapcsolati Adatok</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">Ügyfél neve / Cégnév *</label>
              <input
                type="text"
                required
                placeholder="Pl. Kovács János"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full metro-input font-bold text-base"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">Telefonszám *</label>
              <input
                type="tel"
                required
                placeholder="+36 30 123 4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full metro-input font-mono font-bold text-base"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">E-mail cím</label>
              <input
                type="email"
                placeholder="ugyfel@email.hu"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full metro-input text-base"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer text-base text-slate-200 font-bold">
              <input
                type="checkbox"
                checked={isCompany}
                onChange={(e) => setIsCompany(e.target.checked)}
                className="w-6 h-6 rounded bg-slate-900 border-slate-600 text-emerald-600 focus:ring-0"
              />
              <span>Céges számlát kér (Adószám megadása)</span>
            </label>

            {isCompany && (
              <input
                type="text"
                placeholder="Adószám: 12345678-2-42"
                value={companyTaxNumber}
                onChange={(e) => setCompanyTaxNumber(e.target.value)}
                className="metro-input font-mono font-bold w-64 text-base"
              />
            )}
          </div>
        </div>

        {/* Step 2: Vehicle Data & VIN */}
        <div className="bg-slate-850 border-2 border-slate-700 rounded-3xl p-7 shadow-xl space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 pb-4 border-b-2 border-slate-700">
            <span className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black">2</span>
            <span>Gépjármű Adatok & VIN Lekérdező</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">Rendszám *</label>
              <input
                type="text"
                required
                placeholder="AA-BC-123"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                className="w-full metro-input font-mono font-black text-xl text-yellow-400 uppercase tracking-widest"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">Alvázszám (VIN)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="17 jegyű VIN"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  className="w-full metro-input font-mono uppercase text-sm"
                />
                <button
                  type="button"
                  onClick={handleVinLookup}
                  disabled={vinLoading || !vin}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black text-xs disabled:opacity-50 shrink-0 shadow"
                >
                  {vinLoading ? "..." : "Dekódol"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">Márka</label>
              <input
                type="text"
                placeholder="Pl. Opel, VW, Ford"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full metro-input text-base font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">Modell</label>
              <input
                type="text"
                placeholder="Pl. Astra, Golf, Focus"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full metro-input text-base font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">Évjárat</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full metro-input font-mono font-bold text-base"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">Üzemanyag</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full metro-input font-bold text-base"
              >
                <option value="Diesel">Dízel</option>
                <option value="Petrol">Benzin</option>
                <option value="Hybrid">Hibrid</option>
                <option value="Electric">Elektromos</option>
                <option value="LPG">LPG / Gáz</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">Aktuális km-óra állás</label>
              <input
                type="number"
                placeholder="Pl. 145000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full metro-input font-mono font-bold text-base text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-bold text-base mb-2">Prioritás</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full metro-input font-bold text-base"
              >
                <option value="NORMAL">Normál</option>
                <option value="HIGH">Sürgős (Magas)</option>
                <option value="URGENT">Azonnali (SOS)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Issue Description */}
        <div className="bg-slate-850 border-2 border-slate-700 rounded-3xl p-7 shadow-xl space-y-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 pb-4 border-b-2 border-slate-700">
            <span className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center text-white text-lg font-black">3</span>
            <span>Hibaleírás & Ügyfélkérés</span>
          </h2>

          <div>
            <label className="block text-slate-200 font-bold text-base mb-2">
              Ügyfél által jelzett hibák / Elvégzendő karbantartási műveletek *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Pl. Éves kötelező szerviz: olajcsere szűrőkkel, fékbetétek ellenőrzése, jobb első futómű kopogás kivizsgálása..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full metro-input text-base font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn-metro-green text-xl py-5 px-10 rounded-2xl font-black shadow-2xl disabled:opacity-50"
          >
            <CheckCircle2 className="w-7 h-7" />
            <span>{submitting ? "Munkalap létrehozása..." : "MUNKALAP MEGNYITÁSA & MENTÉS"}</span>
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
        }}
      />
    </div>
  );
}
