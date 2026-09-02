"use client";

import React, { useState } from "react";
import { Sparkles, X, Check, Loader2, Wrench, FileText, AlertTriangle } from "lucide-react";
import { DiagnosisSuggestion } from "@/lib/aiService";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiagnosis?: (diagnosis: DiagnosisSuggestion) => void;
  initialNotes?: string;
  vehiclePlate?: string;
}

export default function AIAssistantModal({
  isOpen,
  onClose,
  onApplyDiagnosis,
  initialNotes = "",
  vehiclePlate = "",
}: AIAssistantModalProps) {
  const [rawNotes, setRawNotes] = useState(initialNotes);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisSuggestion | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!rawNotes.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawNotes, vehicleInfo: vehiclePlate }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">AutoMester AI Műhely Asszisztens</h3>
              <p className="text-xs text-blue-300">
                Nyers hibaleírások strukturálása, javítási javaslatok & közérthető ügyfél-összefoglaló
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Szerelő vagy ügyfél nyers megjegyzése / tünetek:
            </label>
            <div className="flex gap-2">
              <textarea
                rows={3}
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="Pl. Fék ráz 90 felett, fura fémes hang jobb elölről, vagy olajcsere és szűrők kellenek..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setRawNotes("Fékezéskor ráz a kormány és jobb elölről kopog fekvőrendőrön")}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300"
                >
                  💡 Minta: Fék/Futómű
                </button>
                <button
                  type="button"
                  onClick={() => setRawNotes("Időszakos 15.000 km-es olajcsere szűrőkkel és átvizsgálással")}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300"
                >
                  💡 Minta: Olajszerviz
                </button>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !rawNotes.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50 transition"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>AI Elemzés és Generálás</span>
              </button>
            </div>
          </div>

          {/* AI Result */}
          {result && (
            <div className="space-y-3 pt-3 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3.5">
                <div className="font-bold text-blue-300 flex items-center gap-1.5 mb-1">
                  <Wrench className="w-4 h-4" />
                  Strukturált szerviz diagnózis:
                </div>
                <div className="text-slate-200 font-medium">{result.structuredIssue}</div>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-1">Valószínűsíthető okok:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  {result.probableCauses.map((cause, i) => (
                    <li key={i}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-1.5">Javasolt szerelési műveletek:</span>
                <div className="space-y-1.5">
                  {result.recommendedOperations.map((op, i) => (
                    <div key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-200">{op.name}</div>
                        {op.suggestedParts.length > 0 && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Alkatrészek: {op.suggestedParts.join(", ")}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-1 rounded border border-blue-900">
                        {op.estimatedHours} óra
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3.5">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                  <FileText className="w-4 h-4" />
                  Közérthető tájékoztató szöveg az ügyfélnek:
                </div>
                <div className="text-slate-300 italic">„{result.customerExplanation}”</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {result && onApplyDiagnosis && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Mégse
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyDiagnosis(result);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Diagnózis és szöveg bemásolása a munkalapra</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
