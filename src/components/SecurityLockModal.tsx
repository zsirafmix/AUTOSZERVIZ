"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound,
  Wrench,
  AlertCircle
} from "lucide-react";

interface SecurityLockProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export default function SecurityLockModal({ isLocked, onUnlock }: SecurityLockProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if session token exists
    const token = sessionStorage.getItem("automester_session_token");
    if (token) {
      onUnlock();
    }
  }, []);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      setError("Kérjük adja meg a belépési jelszót vagy PIN kódot!");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("automester_session_token", data.sessionToken);
        localStorage.setItem("automester_last_unlocked", new Date().toISOString());
        setPassword("");
        onUnlock();
      } else {
        const err = await res.json();
        setError(err.error || "Helytelen jelszó vagy PIN kód!");
      }
    } catch (e) {
      setError("Hitelesítési hiba");
    } finally {
      setLoading(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === "C") {
      setPassword("");
      setError("");
    } else {
      setPassword((prev) => prev + val);
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
      <div
        style={{ backgroundColor: "#0f172a" }}
        className="w-full max-w-md rounded-3xl border-2 border-slate-700 shadow-2xl p-8 text-white text-center space-y-6"
      >
        {/* Lock Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40">
          <Lock className="w-10 h-10 animate-pulse" />
        </div>

        <div>
          <div className="text-xs font-black uppercase tracking-widest text-blue-400">
            Biztonsági Védelem • AES-256
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            AutoMester Pro ERP
          </h2>
          <p className="text-sm text-slate-300 font-medium mt-1">
            Adja meg a Mesterjelszót vagy a 4 jegyű szerelői PIN kódot a folytatáshoz!
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-xl text-xs text-red-300 font-bold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
            <input
              type="password"
              autoFocus
              placeholder="Jelszó vagy PIN kód (alap: 1234)..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full metro-input pl-12 text-center text-xl font-mono font-black tracking-widest text-yellow-300 rounded-2xl py-4"
            />
          </div>

          {/* Quick 0-9 Keypad for Tablets & Touch Screens */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "↵"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === "↵") handleUnlock();
                  else handleKeypadPress(k);
                }}
                className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-lg font-black transition active:scale-95 shadow border border-slate-700"
              >
                {k}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: "#0078d7" }}
            className="w-full py-4 text-white font-black text-lg rounded-2xl shadow-xl hover:scale-102 transition flex items-center justify-center gap-2.5"
          >
            <Unlock className="w-6 h-6" />
            <span>{loading ? "Feloldás..." : "RENDSZER FELOLDÁSA"}</span>
          </button>
        </form>

        <div className="text-[11px] text-slate-400 font-medium">
          Alapértelmezett PIN: <span className="text-white font-mono font-bold">1234</span> vagy <span className="text-white font-mono font-bold">admin</span>
        </div>
      </div>
    </div>
  );
}
