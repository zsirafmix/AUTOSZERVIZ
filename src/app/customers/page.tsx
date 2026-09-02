"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Car,
  FileText,
  Building,
  Plus,
  CheckCircle2,
  Trash2
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Budapest");
  const [zip, setZip] = useState("1117");
  const [isCompany, setIsCompany] = useState(false);
  const [taxNumber, setTaxNumber] = useState("");
  const [notes, setNotes] = useState("");

  const loadCustomers = async () => {
    try {
      const res = await fetch(`/api/customers?search=${search}`);
      if (res.ok) setCustomers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          address,
          city,
          zip,
          isCompany,
          companyName: isCompany ? name : null,
          taxNumber: isCompany ? taxNumber : null,
          notes,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        setPhone("");
        setEmail("");
        loadCustomers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-400" />
            Ügyfélkapcsolat-Kezelés (CRM)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ügyféltörzs, gépjárművek összerendelése, céges adatok és kommunikációs előzmények.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Új Ügyfél Hozzáadása</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Keresés név, telefonszám, e-mail vagy rendszám alapján..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((cust) => (
          <div
            key={cust.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {cust.name}
                    {cust.isCompany && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px]">
                        CÉG
                      </span>
                    )}
                  </h3>
                  {cust.taxNumber && (
                    <div className="text-[10px] font-mono text-slate-400">Adószám: {cust.taxNumber}</div>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                  {cust.name.charAt(0)}
                </div>
              </div>

              <div className="space-y-1.5 text-slate-300 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono font-medium">{cust.phone}</span>
                </div>
                {cust.email && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cust.email}</span>
                  </div>
                )}
                {cust.address && (
                  <div className="text-slate-400 text-[11px]">
                    📍 {cust.zip} {cust.city}, {cust.address}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rögzített autók ({cust.vehicles?.length || 0}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cust.vehicles && cust.vehicles.length > 0 ? (
                    cust.vehicles.map((v: any) => (
                      <span
                        key={v.id}
                        className="px-2 py-0.5 rounded bg-slate-950 text-blue-400 border border-slate-800 text-[10px] font-mono font-bold"
                      >
                        {v.licensePlate} ({v.brand})
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-600 italic">Nincs még autó rendelve</span>
                  )}
                </div>
              </div>

              {cust.notes && (
                <p className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 italic">
                  „{cust.notes}”
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 text-[10px]">
                {cust.workOrders?.length || 0} korábbi szerviz
              </span>
              <Link
                href={`/reception?customerId=${cust.id}`}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 text-[11px]"
              >
                + Új munkalap
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-slate-100 text-xs space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <UserPlus className="w-5 h-5 text-blue-400" />
              Új Ügyfél Rögzítése
            </h2>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1">Név / Cégnév *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Telefonszám *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">E-mail cím</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Város</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Cím (utca, házszám)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={isCompany}
                    onChange={(e) => setIsCompany(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <span>Céges számlázási profil (Adószám megadása)</span>
                </label>
                {isCompany && (
                  <input
                    type="text"
                    placeholder="Adószám: 12345678-2-42"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Megjegyzések / Fontos információk</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Pl. Mindig reggel 8 előtt hozza az autót..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
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
                  Ügyfél Mentése
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
