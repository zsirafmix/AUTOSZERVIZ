"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole } from "@/lib/types";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  pinCode?: string;
}

export interface BranchInfo {
  id: string;
  name: string;
  code: string;
  address: string;
  bayCount: number;
}

interface ActiveTimer {
  workOrderId: string;
  orderNumber: string;
  licensePlate: string;
  mechanicId: string;
  mechanicName: string;
  startTime: string; // ISO string
  elapsedSeconds: number;
}

interface WorkshopContextType {
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  availableUsers: CurrentUser[];
  currentBranch: BranchInfo;
  setCurrentBranch: (branch: BranchInfo) => void;
  availableBranches: BranchInfo[];
  activeTimers: ActiveTimer[];
  startTimer: (workOrderId: string, orderNumber: string, licensePlate: string) => Promise<void>;
  stopTimer: (workOrderId: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  notifications: string[];
  addNotification: (msg: string) => void;
  removeNotification: (index: number) => void;
}

const defaultUser: CurrentUser = {
  id: "admin-1",
  name: "Kovács István",
  email: "admin@automesterpro.hu",
  role: "ADMIN",
  pinCode: "1234",
};

const defaultBranch: BranchInfo = {
  id: "branch-1",
  name: "AutoMester Központ - Budapest XI.",
  code: "BP-11",
  address: "Hunyadi János út 16.",
  bayCount: 4,
};

const WorkshopContext = createContext<WorkshopContextType>({
  currentUser: defaultUser,
  setCurrentUser: () => {},
  availableUsers: [],
  currentBranch: defaultBranch,
  setCurrentBranch: () => {},
  availableBranches: [],
  activeTimers: [],
  startTimer: async () => {},
  stopTimer: async () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

export function WorkshopProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(defaultUser);
  const [availableUsers, setAvailableUsers] = useState<CurrentUser[]>([]);
  const [currentBranch, setCurrentBranch] = useState<BranchInfo>(defaultBranch);
  const [availableBranches, setAvailableBranches] = useState<BranchInfo[]>([]);
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<string[]>([
    "Üdvözöljük az AutoMester Pro ERP rendszerben!",
    "ML-2026-0089 munkalap fékszerelése javítás alatt.",
  ]);

  // Load initial users, branches, active timers
  useEffect(() => {
    async function loadData() {
      try {
        const [uRes, bRes, tRes] = await Promise.all([
          fetch("/api/users").catch(() => null),
          fetch("/api/branches").catch(() => null),
          fetch("/api/timelogs/active").catch(() => null),
        ]);

        if (uRes && uRes.ok) {
          const uData = await uRes.json();
          setAvailableUsers(uData);
          if (uData.length > 0 && !currentUser.id.includes("-")) {
            setCurrentUser(uData[0]);
          }
        }
        if (bRes && bRes.ok) {
          const bData = await bRes.json();
          setAvailableBranches(bData);
          if (bData.length > 0) setCurrentBranch(bData[0]);
        }
        if (tRes && tRes.ok) {
          const tData = await tRes.json();
          setActiveTimers(tData);
        }
      } catch (err) {
        console.error("Error loading initial workshop context:", err);
      }
    }
    loadData();
  }, []);

  // Timer interval to increment seconds for active timers
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers((prev) =>
        prev.map((t) => ({
          ...t,
          elapsedSeconds: Math.floor((Date.now() - new Date(t.startTime).getTime()) / 1000),
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startTimer = async (workOrderId: string, orderNumber: string, licensePlate: string) => {
    try {
      const res = await fetch("/api/timelogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START",
          workOrderId,
          workerId: currentUser.id,
          workerName: currentUser.name,
        }),
      });
      if (res.ok) {
        const newTimer: ActiveTimer = {
          workOrderId,
          orderNumber,
          licensePlate,
          mechanicId: currentUser.id,
          mechanicName: currentUser.name,
          startTime: new Date().toISOString(),
          elapsedSeconds: 0,
        };
        setActiveTimers((prev) => [...prev.filter((t) => t.workOrderId !== workOrderId), newTimer]);
        addNotification(`⏱️ Stopperóra elindítva: ${orderNumber} (${licensePlate})`);
      }
    } catch (e) {
      console.error("Failed to start timer", e);
    }
  };

  const stopTimer = async (workOrderId: string) => {
    try {
      const res = await fetch("/api/timelogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STOP",
          workOrderId,
          workerId: currentUser.id,
        }),
      });
      if (res.ok) {
        setActiveTimers((prev) => prev.filter((t) => t.workOrderId !== workOrderId));
        addNotification(`⏹️ Stopperóra leállítva és munkaidő rögzítve!`);
      }
    } catch (e) {
      console.error("Failed to stop timer", e);
    }
  };

  const addNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev.slice(0, 9)]);
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <WorkshopContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers,
        currentBranch,
        setCurrentBranch,
        availableBranches,
        activeTimers,
        startTimer,
        stopTimer,
        searchQuery,
        setSearchQuery,
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
}

export function useWorkshop() {
  return useContext(WorkshopContext);
}
