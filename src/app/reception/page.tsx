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
  FileText
} from "lucide-react";
import AIAssistantModal from "@/components/AIAssistantModal";

export default function ReceptionPage() {
  const router = useRouter();
  const { currentBranch, currentUser } = useWorkshop();
  const { isFeatureEnabled } = useFeatureFlags();

  // Form states
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

  // VIN Auto Lookup
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
      alert("Kérjük töltse ki a kötelező mezőket (Név, Telefonszám, Rendszám, Hibaleírás)!");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create or Find Customer
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

      // 2. Create Vehicle
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

      // 3. Create Work Order
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

      // Redirect to newly created work order details
      router.push(`/work-orders/${workOrder.id}`);
    } catch (e) {
      console.error(e);
      alert("Hiba történt a munkalap felvételekor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            Recepció & Munkafelvevő Modul
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-blue-500" />
            Gyors Járműfelvétel & Munkalap Nyitás
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            1 perces bejelentkezés: Ügyféladatok, VIN dekóderes autófelvétel és hibaleírás rögzítés.
          </p>
        </div>

        {isFeatureEnabled("ai_assistant") && (
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Hibaleírás Segéd</span>
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Data */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <UserPlus className="w-4 h-4 text-blue-400" />
            1. Ügyfél Adatok
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Ügyfél neve / Cégnév *</label>
              <input
                type="text"
                required
                placeholder="Pl. Kovács János"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Telefonszám *</label>
              <input
                type="tel"
                required
                placeholder="Pl. +36 30 123 4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">E-mail cím</label>
              <input
                type="email"
                placeholder="ugyfel@pelda.hu"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isCompany}
                onChange={(e) => setIsCompany(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span>Céges ügyfél (Adószám megadása)</span>
            </label>

            {isCompany && (
              <input
                type="text"
                placeholder="Adószám: 12345678-2-42"
                value={companyTaxNumber}
                onChange={(e) => setCompanyTaxNumber(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono w-48"
              />
            )}
          </div>
        </div>

        {/* Step 2: Vehicle Data & VIN Lookup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Car className="w-4 h-4 text-blue-400" />
            2. Jármű Adatok & Automatikus VIN Dekóder
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Rendszám *</label>
              <input
                type="text"
                required
                placeholder="AA-BC-123 vagy ABC-123"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Alvázszám (VIN)</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="17 jegyű VIN kód"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-white focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={handleVinLookup}
                  disabled={vinLoading || !vin}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 shrink-0"
                >
                  {vinLoading ? "..." : "Lekérés"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Márka</label>
              <input
                type="text"
                placeholder="Pl. Volkswagen"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Modell</label>
              <input
                type="text"
                placeholder="Pl. Golf VII Variant"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Évjárat</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Üzemanyag</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Diesel">Dízel</option>
                <option value="Petrol">Benzin</option>
                <option value="Hybrid">Hibrid</option>
                <option value="Electric">Elektromos</option>
                <option value="LPG">LPG / Gáz</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Aktuális km-óra állás</label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Prioritás</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="NORMAL">Normál</option>
                <option value="HIGH">Sürgős (Magas)</option>
                <option value="URGENT">Azonnali (SOS)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Issue Description */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Wrench className="w-4 h-4 text-blue-400" />
            3. Ügyfél Által Jelzett Hibaleírás & Igény
          </h2>

          <div className="text-xs space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Hibajelenség leírása / kért munkálatok *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Pl. Fék ráz 90 felett, jobb első kerék felől kopogás hallható, vagy 15.000 km-es olajcsere szűrőkkel..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-xl shadow-blue-600/30 transition transform hover:scale-[1.02] disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{submitting ? "Munkalap létrehozása folyamatban..." : "Munkalap Létrehozása & Megnyitása"}</span>
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
