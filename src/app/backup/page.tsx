"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Lock,
  Clock,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar
} from "lucide-react";

export default function BackupRestorePage() {
  const [password, setPassword] = useState("admin");
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePassword, setRestorePassword] = useState("admin");
  const [statusMsg, setStatusMsg] = useState("");
  const [scheduleInfo, setScheduleInfo] = useState<any>(null);

  const loadBackupList = async () => {
    try {
      const res = await fetch("/api/backup?action=list");
      if (res.ok) setBackups(await res.json());

      const schedRes = await fetch("/api/backup/schedule");
      if (schedRes.ok) setScheduleInfo(await schedRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBackupList();
  }, []);

  const handleInstantBackup = async () => {
    setLoading(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Trigger browser download of encrypted file
        const blob = new Blob([data.encryptedData], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setStatusMsg(`✅ Sikeres AES-256 titkosított mentés! Fájl: ${data.filename} (Letöltve saját gépre és elmentve a szerverre)`);
        loadBackupList();
      } else {
        alert("Hiba a mentés során");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFile) {
      alert("Kérjük válasszon ki egy .autosafe mentésfájlt!");
      return;
    }

    if (!confirm("Figyelem! A visszaállítás felülírja a jelenlegi adatbázist a mentés tartalmával. Folytatja?")) {
      return;
    }

    setLoading(true);
    setStatusMsg("");
    try {
      const fileText = await restoreFile.text();
      const res = await fetch("/api/backup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedData: fileText.trim(),
          password: restorePassword,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMsg(`🎉 Adatbázis sikeresen visszaállítva! (${data.meta?.createdAt})`);
        alert("Sikeres visszaállítás! Az oldal újratöltődik.");
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.error || "Sikertelen visszaállítás! Hibás jelszó vagy sérült fájl.");
      }
    } catch (e) {
      console.error(e);
      alert("Hiba történt a visszaállítás során");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div
        style={{ backgroundColor: "#0078d7" }}
        className="p-8 rounded-3xl text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div>
          <span className="px-3 py-1 bg-black/30 rounded-lg text-xs font-black uppercase tracking-wider">
            Adatbiztonság & Katasztrófa-elhárítás
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 flex items-center gap-3">
            <ShieldCheck className="w-9 h-9" />
            Biztonsági Mentés & Visszaállítás (AES-256)
          </h1>
          <p className="text-base text-blue-100 font-semibold mt-1 max-w-2xl">
            Napi automatikus mentés 13:00-kor, azonnali letöltés saját gépre és 1-kattintásos helyreállítás zsarolóvírus vagy hackertámadás ellen.
          </p>
        </div>

        <button
          onClick={handleInstantBackup}
          disabled={loading}
          style={{ backgroundColor: "#107c41" }}
          className="px-8 py-4 rounded-2xl text-white font-black text-lg flex items-center gap-3 shadow-2xl hover:scale-105 transition-all shrink-0 border-2 border-white/40 disabled:opacity-50"
        >
          <Save className="w-7 h-7" />
          <span>{loading ? "Mentés folyamatban..." : "MENTÉS MOST (AZONNALI)"}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. MENTÉS MOST ÉS AUTOMATIKUS ÜTEMEZÉS */}
        <div
          style={{ backgroundColor: "#1e293b" }}
          className="p-7 rounded-3xl border-2 border-slate-700 shadow-xl space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Azonnali Mentés Letöltése</h2>
              <div className="text-xs text-slate-400 font-semibold">Letöltés saját gépre & mentés felhőbe</div>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-200 font-bold mb-1.5">Titkosítási Mesterjelszó (AES-256)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Adja meg a mentés jelszavát..."
                className="w-full metro-input font-mono font-bold text-base"
              />
              <div className="text-xs text-slate-400 mt-1 font-medium">
                Ezzel a jelszóval lesz titkosítva a teljes mentés. Visszaállításkor is ezt a jelszót kell megadni!
              </div>
            </div>

            <button
              onClick={handleInstantBackup}
              disabled={loading}
              style={{ backgroundColor: "#0078d7" }}
              className="w-full py-4 text-white font-black text-base rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-102 transition"
            >
              <HardDrive className="w-5 h-5" />
              <span>Titkosított Mentés Generálása & Letöltése (.autosafe)</span>
            </button>

            {/* Daily 13:00 Auto Backup Info */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Napi Automatikus Mentés:
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                  Minden nap 13:00-kor AKTÍV
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                A rendszer minden nap pontban 13:00-kor önállóan készít egy teljes mentést a szerver védett tárhelyére.
              </p>
              {scheduleInfo?.lastBackupDate && (
                <div className="text-[11px] text-slate-400 font-mono">
                  Legutóbbi szervermentés: {new Date(scheduleInfo.lastBackupDate).toLocaleString("hu-HU")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. ADATBÁZIS VISSZAÁLLÍTÁSA (RESTORE) */}
        <div
          style={{ backgroundColor: "#1e293b" }}
          className="p-7 rounded-3xl border-2 border-slate-700 shadow-xl space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
            <div className="p-2.5 bg-orange-600 rounded-xl text-white">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Adatok Visszaállítása Mentésből</h2>
              <div className="text-xs text-slate-400 font-semibold">1-kattintásos helyreállítás katasztrófa esetén</div>
            </div>
          </div>

          <form onSubmit={handleRestore} className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-200 font-bold mb-1.5">Válassza ki a .autosafe mentésfájlt *</label>
              <input
                type="file"
                accept=".autosafe,.enc,.json"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                className="w-full p-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-bold mb-1.5">Mentés Titkosítási Jelszava *</label>
              <input
                type="password"
                required
                value={restorePassword}
                onChange={(e) => setRestorePassword(e.target.value)}
                placeholder="Adja meg a mentéshez tartozó jelszót..."
                className="w-full metro-input font-mono font-bold text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !restoreFile}
              style={{ backgroundColor: "#d83b01" }}
              className="w-full py-4 text-white font-black text-base rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-102 transition disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" />
              <span>TELJES ADATBÁZIS VISSZAÁLLÍTÁSA</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. SZERVEREN TÁROLT MENTÉSEK LISTÁJA */}
      <div
        style={{ backgroundColor: "#1e293b" }}
        className="p-7 rounded-3xl border-2 border-slate-700 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-400" />
            Szerveren Tárolt Korábbi Mentések ({backups.length})
          </h3>
          <button
            onClick={loadBackupList}
            className="text-xs text-blue-400 hover:text-white font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Frissítés
          </button>
        </div>

        <div className="divide-y divide-slate-700/60">
          {backups.length > 0 ? (
            backups.map((b, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-mono font-bold text-white">{b.filename}</div>
                    <div className="text-slate-400">{(b.sizeBytes / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <span className="font-mono text-slate-300 font-semibold">
                  {new Date(b.createdAt).toLocaleString("hu-HU")}
                </span>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-slate-400 font-semibold">
              Még nincs tárolt mentés a szerveren. Kattintson a fenti <b>MENTÉS MOST</b> gombra!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
