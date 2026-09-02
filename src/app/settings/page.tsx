"use client";

import React, { useEffect, useState } from "react";
import { useFeatureFlags } from "@/context/FeatureFlagContext";
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Building2,
  Save,
  RotateCcw
} from "lucide-react";

export default function MetroSettingsPage() {
  const { flagList, toggleFlag, refreshFlags } = useFeatureFlags();
  const [settings, setSettings] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) setSettings(await res.json());
      } catch (e) {
        console.error(e);
      }
    }
    loadSettings();
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) alert("Beállítások sikeresen mentve!");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 px-4">
      {/* Metro Header */}
      <div className="bg-slate-700 text-white p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-black/30 rounded-lg text-xs font-black uppercase tracking-wider">
            Rendszerbeállítások
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 flex items-center gap-3">
            <Settings className="w-9 h-9" />
            16 Moduláris Funkciókapcsoló & Beállítások
          </h1>
          <p className="text-base text-slate-200 font-semibold mt-1 max-w-2xl">
            Itt kapcsolhatja ki vagy be a rendszer bármely funkcióját egyenként. A kikapcsolt modul azonnal eltűnik a menükből.
          </p>
        </div>
      </div>

      {/* FEATURE FLAGS TILES GRID */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2.5 pb-2 border-b-2 border-slate-700">
          <span>Funkciók Ki- és Bekapcsolása (16 Modul)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {flagList.map((flag) => {
            const isEnabled = flag.isEnabled;
            return (
              <div
                key={flag.key}
                onClick={() => toggleFlag(flag.key as any, !flag.isEnabled)}
                className={`metro-tile p-6 rounded-2xl border-2 flex flex-col justify-between min-h-[170px] cursor-pointer transition ${
                  isEnabled
                    ? "bg-blue-600 text-white border-blue-400 shadow-xl"
                    : "bg-slate-850 text-slate-400 border-slate-700 hover:border-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 bg-black/30 rounded-lg font-black uppercase tracking-wider">
                    {flag.category}
                  </span>
                  {isEnabled ? (
                    <span className="text-xs px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-lg uppercase">
                      BEKAPCSOLVA
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 bg-slate-700 text-slate-300 font-black rounded-lg uppercase">
                      KIKAPCSOLVA
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-black leading-tight">{flag.label}</h3>
                  <p className="text-xs opacity-90 line-clamp-2 mt-1 font-medium leading-relaxed">
                    {flag.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SYSTEM GENERAL SETTINGS */}
      <div className="bg-slate-850 border-2 border-slate-700 rounded-3xl p-7 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-700">
          <h2 className="text-2xl font-black text-white">Alapértelmezett Szervizadatok & Árak</h2>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-metro-primary text-base py-3 px-8 rounded-xl font-black"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? "Mentés..." : "Beállítások Mentése"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-base">
          {settings.map((s) => (
            <div key={s.id || s.key}>
              <label className="block text-slate-200 font-bold mb-2">{s.label}</label>
              <input
                type="text"
                value={s.value}
                onChange={(e) => handleSettingChange(s.key, e.target.value)}
                className="w-full metro-input font-bold text-base"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
