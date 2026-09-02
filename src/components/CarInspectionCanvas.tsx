"use client";

import React, { useState } from "react";
import { DamagePoint } from "@/lib/types";
import { AlertCircle, Plus, Trash2, Camera, Check } from "lucide-react";

interface CarInspectionCanvasProps {
  initialPoints?: DamagePoint[];
  onChange?: (points: DamagePoint[]) => void;
  readOnly?: boolean;
}

export default function CarInspectionCanvas({
  initialPoints = [],
  onChange,
  readOnly = false,
}: CarInspectionCanvasProps) {
  const [points, setPoints] = useState<DamagePoint[]>(initialPoints);
  const [selectedPoint, setSelectedPoint] = useState<DamagePoint | null>(null);
  const [activeView, setActiveView] = useState<"top" | "side">("top");

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newPoint: DamagePoint = {
      id: `dp_${Date.now()}`,
      x,
      y,
      view: activeView === "top" ? "top" : "left",
      type: "SCRATCH",
      severity: "LIGHT",
      note: "Új sérülés jelölve",
    };

    const updated = [...points, newPoint];
    setPoints(updated);
    setSelectedPoint(newPoint);
    onChange?.(updated);
  };

  const handleUpdatePoint = (id: string, updates: Partial<DamagePoint>) => {
    const updated = points.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPoints(updated);
    if (selectedPoint?.id === id) {
      setSelectedPoint({ ...selectedPoint, ...updates });
    }
    onChange?.(updated);
  };

  const handleDeletePoint = (id: string) => {
    const updated = points.filter((p) => p.id !== id);
    setPoints(updated);
    if (selectedPoint?.id === id) setSelectedPoint(null);
    onChange?.(updated);
  };

  const getSeverityColor = (sev: string) => {
    if (sev === "SEVERE") return "bg-red-500 border-red-700 text-white";
    if (sev === "MEDIUM") return "bg-amber-500 border-amber-700 text-white";
    return "bg-yellow-400 border-yellow-600 text-slate-950";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Interaktív Karosszéria Sérüléstérkép
          </h3>
          <p className="text-xs text-slate-400">
            {readOnly
              ? "Rögzített sérülések és karcok nézete"
              : "Kattintson az autó ábrájára sérülés vagy karc jelöléséhez!"}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setActiveView("top")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              activeView === "top" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Felülnézet
          </button>
          <button
            type="button"
            onClick={() => setActiveView("side")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              activeView === "side" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Oldalnézet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Car Diagram SVG Canvas */}
        <div className="lg:col-span-2 relative bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-6 select-none overflow-hidden min-h-[300px]">
          <div
            onClick={handleCanvasClick}
            className="relative w-full max-w-md aspect-[16/9] cursor-crosshair flex items-center justify-center"
          >
            {activeView === "top" ? (
              // Top View Car SVG Outline
              <svg viewBox="0 0 400 200" className="w-full h-full text-slate-700 fill-slate-900 stroke-current stroke-2">
                {/* Car Silhouette */}
                <rect x="30" y="35" width="340" height="130" rx="65" className="stroke-slate-600 fill-slate-800/40" />
                {/* Windshield Front */}
                <path d="M 120 45 L 140 65 L 140 135 L 120 155 Z" className="stroke-blue-500/60 fill-blue-950/40" />
                {/* Roof */}
                <rect x="140" y="55" width="130" height="90" rx="10" className="stroke-slate-600 fill-slate-850" />
                {/* Rear Window */}
                <path d="M 270 65 L 290 45 L 290 155 L 270 135 Z" className="stroke-blue-500/60 fill-blue-950/40" />
                {/* Front Bumper & Headlights */}
                <path d="M 30 65 Q 20 100 30 135" className="stroke-amber-400/80 fill-none stroke-3" />
                <circle cx="55" cy="50" r="8" className="fill-amber-300/30 stroke-amber-400" />
                <circle cx="55" cy="150" r="8" className="fill-amber-300/30 stroke-amber-400" />
                {/* Rear Lights */}
                <path d="M 370 65 Q 380 100 370 135" className="stroke-red-500 fill-none stroke-3" />
                {/* Wheels */}
                <rect x="75" y="20" width="40" height="15" rx="4" className="fill-slate-950 stroke-slate-500" />
                <rect x="75" y="165" width="40" height="15" rx="4" className="fill-slate-950 stroke-slate-500" />
                <rect x="285" y="20" width="40" height="15" rx="4" className="fill-slate-950 stroke-slate-500" />
                <rect x="285" y="165" width="40" height="15" rx="4" className="fill-slate-950 stroke-slate-500" />
                {/* Direction indicators */}
                <text x="50" y="105" className="text-[11px] fill-slate-500 font-bold tracking-widest">ELEJE</text>
                <text x="320" y="105" className="text-[11px] fill-slate-500 font-bold tracking-widest">HÁTULJA</text>
              </svg>
            ) : (
              // Side View Car SVG Outline
              <svg viewBox="0 0 400 180" className="w-full h-full text-slate-700 fill-slate-900 stroke-current stroke-2">
                <path d="M 30 110 L 50 110 L 70 80 L 140 70 L 220 70 L 290 85 L 360 95 L 370 125 L 330 125 A 25 25 0 0 0 280 125 L 150 125 A 25 25 0 0 0 100 125 L 30 125 Z" className="stroke-slate-500 fill-slate-800/50" />
                {/* Wheels */}
                <circle cx="125" cy="125" r="22" className="fill-slate-950 stroke-slate-400 stroke-2" />
                <circle cx="125" cy="125" r="10" className="fill-slate-700" />
                <circle cx="305" cy="125" r="22" className="fill-slate-950 stroke-slate-400 stroke-2" />
                <circle cx="305" cy="125" r="10" className="fill-slate-700" />
                {/* Windows */}
                <path d="M 145 76 L 215 76 L 215 100 L 145 100 Z" className="fill-blue-950/60 stroke-blue-500/50" />
                <path d="M 222 76 L 280 88 L 270 100 L 222 100 Z" className="fill-blue-950/60 stroke-blue-500/50" />
              </svg>
            )}

            {/* Render Damage Markers */}
            {points.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPoint(p);
                }}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 shadow-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition transform hover:scale-125 z-10 ${getSeverityColor(
                  p.severity
                )} ${selectedPoint?.id === p.id ? "ring-4 ring-white scale-110" : ""}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Damage Point Details & Edit */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between text-xs">
          {selectedPoint ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full ${getSeverityColor(selectedPoint.severity)}`}></span>
                  Sérülés #{points.findIndex((p) => p.id === selectedPoint.id) + 1} részletei
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDeletePoint(selectedPoint.id)}
                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Sérülés típusa</label>
                <select
                  disabled={readOnly}
                  value={selectedPoint.type}
                  onChange={(e) => handleUpdatePoint(selectedPoint.id, { type: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                >
                  <option value="SCRATCH">Felületi karc</option>
                  <option value="DENT">Horpadás / benyomódás</option>
                  <option value="CRACK">Repedés / Törés</option>
                  <option value="RUST">Korrózió / Rozsda</option>
                  <option value="STONE_CHIP">Kőfelverődés</option>
                  <option value="OTHER">Egyéb sérülés</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Súlyosság</label>
                <div className="grid grid-cols-3 gap-1">
                  {(("LIGHT,MEDIUM,SEVERE").split(",") as ("LIGHT" | "MEDIUM" | "SEVERE")[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      disabled={readOnly}
                      onClick={() => handleUpdatePoint(selectedPoint.id, { severity: sev })}
                      className={`p-1 text-center rounded border font-semibold text-[10px] ${
                        selectedPoint.severity === sev
                          ? "bg-blue-600 border-blue-400 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-400"
                      }`}
                    >
                      {sev === "LIGHT" ? "Enyhe" : sev === "MEDIUM" ? "Közepes" : "Súlyos"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Megjegyzés / Hely</label>
                <textarea
                  disabled={readOnly}
                  rows={3}
                  value={selectedPoint.note || ""}
                  onChange={(e) => handleUpdatePoint(selectedPoint.id, { note: e.target.value })}
                  placeholder="Pl. Jobb első sárvédőn 5 cm-es kulcskarc..."
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
              <p>Nincs kijelölt sérülés.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Kattintson az autó diagramján egy jelölőre vagy jelöljön új pontot.
              </p>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
            <span>Összes rögzített sérülés:</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
              {points.length} pont
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
