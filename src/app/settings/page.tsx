"use client";

import React, { useEffect, useState } from "react";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import { FeatureFlagItem, FeatureFlagKey } from "@/lib/types";
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Cpu,
  Save,
  CheckCircle2,
  History,
  FileText
} from "lucide-react";

export default function SettingsPage() {
  const { flagList, toggleFlag, isFeatureEnabled } = useFeatureFlags();
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"flags" | "general" | "audit">("flags");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, aRes] = await Promise.all([
          fetch("/api/settings").catch(() => null),
          fetch("/api/audit-logs").catch(() => null),
        ]);
        if (sRes && sRes.ok) setSettings(await sRes.json());
        if (aRes && aRes.ok) setAuditLogs(await aRes.json());
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-blue-400" />
            Rendszerbeállítások & Moduláris Funkciókapcsolók
          </h1>
          <p className="text-sm text-slate-400">
            Minden szervizfunkció és modul egyenként ki- és bekapcsolható (Feature Flags), valamint testreszabhatók a műhely alapadatai.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("flags")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === "flags" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Funkciókapcsolók ({flagList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === "general" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Műhely Beállítások</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === "audit" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Változáskövetés (Audit)</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          A beállítások sikeresen mentve lettek!
        </div>
      )}

      {/* TAB 1: FEATURE FLAGS */}
      {activeTab === "flags" && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-2xl text-xs text-blue-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm mb-0.5">
                Moduláris Funkcióvezérlés (Feature Flags)
              </div>
              Itt kapcsolhatja ki azokat a modulokat, amelyekre a műhelynek jelenleg nincs szüksége (például ha nincs külön raktáros vagy beszállítói integráció, a menüből és az űrlapokból automatikusan eltűnik).
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flagList.map((flag) => {
              const enabled = flag.isEnabled;
              return (
                <div
                  key={flag.key}
                  className={`p-4 rounded-2xl border transition shadow-md flex flex-col justify-between ${
                    enabled
                      ? "bg-slate-900 border-slate-700/80"
                      : "bg-slate-950/60 border-slate-800/50 opacity-65"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-sm text-slate-100">
                        {flag.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFlag(flag.key, !enabled)}
                        className="focus:outline-none transition transform hover:scale-105"
                      >
                        {enabled ? (
                          <ToggleRight className="w-8 h-8 text-blue-500 fill-blue-500/20" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      {flag.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500 uppercase">{flag.key}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      enabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                    }`}>
                      {enabled ? "BEKAPCSOLVA" : "KIKAPCSOLVA"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL SETTINGS */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building2 className="w-5 h-5 text-blue-400" />
            Alapértelmezett Szerviz és Pénzügyi Adatok
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {settings.map((s) => (
              <div key={s.key}>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  {s.label || s.key}
                </label>
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => handleSettingChange(s.key, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
            >
              <Save className="w-4 h-4" />
              <span>Beállítások Mentése</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Rendszerszintű Változáskövetési Napló (Audit Trail)
              </h2>
              <p className="text-xs text-slate-400">
                Minden fontos ármódosítás, státuszváltás, jóváhagyás és törlés pontos időbélyeggel rögzítésre kerül.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{auditLogs.length} bejegyzés</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase text-[10px] bg-slate-950/60">
                <tr>
                  <th className="p-3 rounded-l-lg">Időpont</th>
                  <th className="p-3">Felhasználó</th>
                  <th className="p-3">Művelet</th>
                  <th className="p-3">Entitás</th>
                  <th className="p-3 rounded-r-lg">Részletes Leírás</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString("hu-HU")}
                    </td>
                    <td className="p-3 font-semibold text-slate-200">
                      {log.userName}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {log.entityType}
                    </td>
                    <td className="p-3 text-slate-300">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
