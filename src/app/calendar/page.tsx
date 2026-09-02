"use client";

import React, { useEffect, useState } from "react";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Car,
  User,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wrench
} from "lucide-react";

export default function CalendarPage() {
  const { currentBranch } = useWorkshop();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Appointment Form
  const [title, setTitle] = useState("");
  const [serviceType, setServiceType] = useState("GENERAL_SERVICE");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [bayNumber, setBayNumber] = useState("1");
  const [date, setDate] = useState("2026-09-03");
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");

  const loadAppointments = async () => {
    try {
      const res = await fetch(`/api/appointments?branchId=${currentBranch?.id || ""}`);
      if (res.ok) setAppointments(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [currentBranch]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + 3600000 * 2); // 2 hours

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: currentBranch.id,
          title,
          serviceType,
          clientName,
          clientPhone,
          vehiclePlate,
          bayNumber: Number(bayNumber),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          customerNotes: notes,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setTitle("");
        setClientName("");
        setClientPhone("");
        setVehiclePlate("");
        loadAppointments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const bays = [1, 2, 3, 4];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-blue-400" />
            Műhely Naptár & Emelőállás Foglaltság
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Munkaállomások, emelők és szerelői beosztások kezelése ({currentBranch?.name}).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Új Időpont Előjegyzése</span>
        </button>
      </div>

      {/* Bay View Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bays.map((bay) => {
          const bayAppointments = appointments.filter((a) => a.bayNumber === bay);

          return (
            <div
              key={bay}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
            >
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-bold text-xs">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Wrench className="w-4 h-4" />
                  {bay}. számú Emelőállás
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  {bayAppointments.length} foglalás
                </span>
              </div>

              <div className="space-y-2.5">
                {bayAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl text-xs space-y-1.5 transition"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span className="font-mono text-blue-400">
                        {appt.vehiclePlate || appt.vehicle?.licensePlate || "IDŐPONT"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(appt.startTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-200 truncate">
                      {appt.title}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      👤 {appt.clientName || appt.customer?.name} ({appt.clientPhone || appt.customer?.phone})
                    </div>

                    {appt.customerNotes && (
                      <p className="text-[10px] text-slate-500 italic bg-slate-900 p-1.5 rounded border border-slate-800">
                        „{appt.customerNotes}”
                      </p>
                    )}
                  </div>
                ))}

                {bayAppointments.length === 0 && (
                  <div className="text-center py-8 text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl">
                    Szabad munkaállomás
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 text-slate-100 text-xs space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              Új Időpont Foglalása
            </h2>

            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Szolgáltatás megnevezése *</label>
                <input
                  type="text"
                  required
                  placeholder="Pl. Időszakos olajcsere & szűrők"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Ügyfél neve</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Telefonszám</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Rendszám</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Emelőállás</label>
                  <select
                    value={bayNumber}
                    onChange={(e) => setBayNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="1">1. Emelő</option>
                    <option value="2">2. Emelő</option>
                    <option value="3">3. Emelő</option>
                    <option value="4">4. Emelő</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Dátum</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Kezdési időpont</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Megjegyzések</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Időpont Mentése
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
