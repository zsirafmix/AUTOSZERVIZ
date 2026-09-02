"use client";

import React, { useEffect, useState } from "react";
import {
  Car,
  Search,
  BookOpen,
  Calendar,
  Wrench,
  FileText,
  AlertTriangle,
  History,
  CheckCircle2
} from "lucide-react";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const loadVehicles = async () => {
    try {
      const res = await fetch(`/api/vehicles?search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
        if (data.length > 0 && !selectedVehicle) setSelectedVehicle(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Car className="w-7 h-7 text-blue-400" />
            Járműnyilvántartás & Digitális Szervizkönyv
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Minden korábbi javítás időrendben: alkatrészek, elvégzett munkák, kilométeróra állások és műszaki esedékességek.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Keresés rendszám, márka, alvázszám (VIN) vagy tulajdonos szerint..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="font-bold text-sm text-slate-200 pb-2 border-b border-slate-800 flex justify-between">
            <span>Nyilvántartott Járművek</span>
            <span className="text-xs text-slate-400 font-mono">{vehicles.length} db</span>
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {vehicles.map((veh) => {
              const isSelected = selectedVehicle?.id === veh.id;
              return (
                <div
                  key={veh.id}
                  onClick={() => setSelectedVehicle(veh)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition transform ${
                    isSelected
                      ? "bg-blue-950/60 border-blue-500 shadow-md"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold text-sm mb-1">
                    <span className="text-blue-400">{veh.licensePlate}</span>
                    <span className="text-[11px] text-slate-400 font-sans">{veh.year}</span>
                  </div>
                  <div className="font-bold text-slate-200 text-xs truncate">
                    {veh.brand} {veh.model}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>👤 {veh.customer?.name}</span>
                    <span className="font-mono font-bold text-slate-300">{veh.mileage?.toLocaleString()} km</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedVehicle ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white font-mono">
                      {selectedVehicle.licensePlate}
                    </h2>
                    <span className="text-sm font-bold text-slate-300">
                      {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    VIN: <span className="text-slate-200 font-bold">{selectedVehicle.vin || "Nincs rögzítve"}</span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-slate-400">Tulajdonos:</div>
                  <div className="font-bold text-white text-sm">{selectedVehicle.customer?.name}</div>
                  <div className="text-slate-400 font-mono">{selectedVehicle.customer?.phone}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Futásteljesítmény</span>
                  <span className="text-white font-bold font-mono text-sm">{selectedVehicle.mileage?.toLocaleString()} km</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Üzemanyag & Váltó</span>
                  <span className="text-white font-bold text-xs">{selectedVehicle.fuelType} • {selectedVehicle.transmission || "DSG"}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Motorkód & Teljesítmény</span>
                  <span className="text-white font-bold font-mono text-xs">{selectedVehicle.engineCode || "CRLB"} ({selectedVehicle.powerHp || 150} LE)</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Műszaki vizsga lejárata</span>
                  <span className="text-emerald-400 font-bold font-mono text-xs">
                    {selectedVehicle.motExpiry ? new Date(selectedVehicle.motExpiry).toLocaleDateString("hu-HU") : "2026.11.15"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Digitális Szervizkönyv Idővonal
                </h3>

                <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
                  {selectedVehicle.workOrders && selectedVehicle.workOrders.length > 0 ? (
                    selectedVehicle.workOrders.map((wo: any) => (
                      <div key={wo.id} className="relative pl-6 text-xs">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-slate-900"></div>

                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-400">{wo.orderNumber}</span>
                              <span className="text-slate-400 font-mono text-[11px]">
                                📅 {new Date(wo.createdAt).toLocaleDateString("hu-HU")}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                              {wo.status}
                            </span>
                          </div>

                          <p className="text-slate-200 font-medium">
                            {wo.issueDescription}
                          </p>

                          {wo.publicNotes && (
                            <p className="text-slate-400 italic text-[11px]">
                              „{wo.publicNotes}”
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                            <span className="font-mono font-bold text-slate-400">
                              {wo.mileageAtService ? `${wo.mileageAtService.toLocaleString()} km-nél` : ""}
                            </span>
                            <span className="font-mono font-bold text-emerald-400">
                              {wo.totalGross ? `${wo.totalGross.toLocaleString()} Ft` : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="pl-6 text-slate-500 text-xs italic">
                      Még nem rögzítettek szervizt ehhez a járműhöz.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              Válasszon ki egy autót a bal oldali listából.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
