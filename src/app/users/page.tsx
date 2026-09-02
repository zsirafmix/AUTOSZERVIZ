"use client";

import React, { useEffect, useState } from "react";
import { useWorkshop } from "@/context/WorkshopContext";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Wrench,
  Receipt,
  Package,
  Phone,
  Mail,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  X
} from "lucide-react";

export default function UsersManagementPage() {
  const { availableUsers, availableBranches, currentBranch, setCurrentUser } = useWorkshop();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MECHANIC");
  const [phone, setPhone] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [branchId, setBranchId] = useState("");

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openNewModal = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setRole("MECHANIC");
    setPhone("");
    setPinCode("");
    setBranchId(currentBranch?.id || availableBranches[0]?.id || "");
    setModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPhone(u.phone || "");
    setPinCode(u.pinCode || "");
    setBranchId(u.branchId || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Név és E-mail kitöltése kötelező!");
      return;
    }

    try {
      const url = "/api/users";
      const method = editingUser ? "PUT" : "POST";
      const payload = {
        id: editingUser?.id,
        name,
        email,
        role,
        phone,
        pinCode,
        branchId,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setModalOpen(false);
        loadUsers();
        if (editingUser) setCurrentUser(saved);
      } else {
        const err = await res.json();
        alert(err.error || "Hiba mentéskor");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`Biztosan törölni szeretné "${userName}" munkatársat?`)) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert("Nem sikerült törölni a felhasználót");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case "ADMIN":
        return <span style={{ backgroundColor: "#2563eb" }} className="px-3 py-1 text-white rounded-lg text-xs font-black uppercase flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Tulajdonos / Admin</span>;
      case "RECEPTIONIST":
        return <span style={{ backgroundColor: "#059669" }} className="px-3 py-1 text-white rounded-lg text-xs font-black uppercase flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Munkafelvevő</span>;
      case "MECHANIC":
        return <span style={{ backgroundColor: "#ea580c" }} className="px-3 py-1 text-white rounded-lg text-xs font-black uppercase flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Szerelő</span>;
      case "WAREHOUSE":
        return <span style={{ backgroundColor: "#7c3aed" }} className="px-3 py-1 text-white rounded-lg text-xs font-black uppercase flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Raktáros</span>;
      case "ACCOUNTANT":
        return <span style={{ backgroundColor: "#e11d48" }} className="px-3 py-1 text-white rounded-lg text-xs font-black uppercase flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" /> Könyvelő</span>;
      default:
        return <span className="px-3 py-1 bg-slate-700 text-white rounded-lg text-xs font-black uppercase">{r}</span>;
    }
  };

  const getRolePermissionsSummary = (r: string) => {
    switch (r) {
      case "ADMIN":
        return "Teljes hozzáférés minden modulhoz, beállításokhoz, pénzügyekhez és felhasználókhoz.";
      case "RECEPTIONIST":
        return "Ügyfél és járműfelvétel, munkalap nyitás, árajánlatok és naptári időpontok kezelése.";
      case "MECHANIC":
        return "Munkalapok végrehajtása, élő stopperóra indítás/leállítás, állapotfelmérő checklist.";
      case "WAREHOUSE":
        return "Alkatrészkezelés, raktárkészlet módosítás, beszállítói rendelések kezelése.";
      case "ACCOUNTANT":
        return "Számlák kiállítása, pénzügyi kimutatások, kintlévőségek és bevételek áttekintése.";
      default:
        return "Alapszintű hozzáférés.";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        style={{ backgroundColor: "#2563eb" }}
        className="p-8 rounded-3xl text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <span className="px-3 py-1 bg-black/30 rounded-lg text-xs font-black uppercase tracking-wider">
            Felhasználó- & Jogosultságkezelés
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 flex items-center gap-3">
            <Users className="w-9 h-9" />
            Munkatársak & Hozzáférési Jogok
          </h1>
          <p className="text-base text-blue-100 font-semibold mt-1 max-w-2xl">
            Itt tudja átírni a meglévő felhasználók nevét, beosztását, és tetszőleges számú új kollégát hozzáadni különböző jogosultságokkal és PIN kódokkal.
          </p>
        </div>

        <button
          onClick={openNewModal}
          style={{ backgroundColor: "#10b981" }}
          className="px-6 py-3.5 rounded-2xl text-white font-black text-base flex items-center gap-2.5 shadow-2xl hover:scale-105 transition-all shrink-0 border-2 border-white/40"
        >
          <UserPlus className="w-6 h-6" />
          <span>+ ÚJ MUNKATÁRS HOZZÁADÁSA</span>
        </button>
      </div>

      {/* Users Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((u) => (
          <div
            key={u.id}
            style={{ backgroundColor: "#1e293b" }}
            className="p-6 rounded-2xl border-2 border-slate-700/80 text-white shadow-xl flex flex-col justify-between space-y-4 hover:border-blue-500 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-lg font-black text-white shadow-md">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black leading-tight text-white">
                      {u.name}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {u.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(u)}
                    className="p-2 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition shadow"
                    title="Szerkesztés"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {users.length > 1 && (
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="p-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition shadow"
                      title="Törlés"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {getRoleBadge(u.role)}
                {u.pinCode && (
                  <span className="px-2.5 py-1 bg-slate-800 text-yellow-300 border border-slate-700 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> PIN: {u.pinCode}
                  </span>
                )}
                {u.phone && (
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {u.phone}
                  </span>
                )}
              </div>

              <div className="mt-3 p-3 bg-slate-900 rounded-xl text-xs text-slate-300 font-medium leading-relaxed">
                {getRolePermissionsSummary(u.role)}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Telephely: {u.branch?.name || "Központ"}</span>
              <button
                onClick={() => {
                  setCurrentUser(u);
                  alert(`Átváltva: ${u.name} profiljára!`);
                }}
                className="text-blue-400 hover:text-blue-300 font-bold underline"
              >
                Váltás erre a profilra
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            style={{ backgroundColor: "#1e293b" }}
            className="w-full max-w-xl rounded-3xl border-2 border-slate-600 shadow-2xl p-7 text-white space-y-6 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-blue-400" />
                <span>{editingUser ? "Munkatárs Adatainak Módosítása" : "Új Munkatárs Hozzáadása"}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">Munkatárs Teljes Neve *</label>
                <input
                  type="text"
                  required
                  placeholder="Pl. Kovács Gábor vagy Szabó Péter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full metro-input font-bold text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">E-mail cím *</label>
                  <input
                    type="email"
                    required
                    placeholder="munkatars@automester.hu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full metro-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">Telefonszám</label>
                  <input
                    type="tel"
                    placeholder="+36 30 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full metro-input text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">Szerepkör & Jogosultság *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full metro-input font-bold text-sm bg-slate-900 cursor-pointer"
                  >
                    <option value="ADMIN">👑 ADMIN / Tulajdonos / Vezető (Teljes jog)</option>
                    <option value="RECEPTIONIST">📋 RECEPTIONIST / Munkafelvevő</option>
                    <option value="MECHANIC">🔧 MECHANIC / Autószerelő</option>
                    <option value="WAREHOUSE">📦 WAREHOUSE / Raktáros</option>
                    <option value="ACCOUNTANT">🧾 ACCOUNTANT / Könyvelő</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">Műhely Tablet PIN Kód (4 számjegy)</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Pl. 1234 vagy 2222"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full metro-input font-mono font-black text-base text-yellow-300 tracking-widest"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl text-xs text-slate-300 font-medium space-y-1">
                <div className="font-bold text-blue-400">Szerepkör hatásköre:</div>
                <div>{getRolePermissionsSummary(role)}</div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: "#2563eb" }}
                  className="px-8 py-3 rounded-xl text-white font-black text-base shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{editingUser ? "Változtatások Mentése" : "Munkatárs Létrehozása"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
