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

export interface ActiveTimer {
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
  isLocked: boolean;
  lockApp: () => void;
  unlockApp: () => void;
}

const defaultUser: CurrentUser = {
  id: "default-user",
  name: "Műhelyvezető",
  email: "admin@automester.hu",
  role: "ADMIN",
};

const defaultBranch: BranchInfo = {
  id: "default-branch",
  name: "Központi Autószerviz",
  code: "HQ-01",
  address: "Budapest",
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
  isLocked: false,
  lockApp: () => {},
  unlockApp: () => {},
});

export function WorkshopProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<CurrentUser>(defaultUser);
  const [availableUsers, setAvailableUsers] = useState<CurrentUser[]>([]);
  const [currentBranch, setCurrentBranchState] = useState<BranchInfo>(defaultBranch);
  const [availableBranches, setAvailableBranches] = useState<BranchInfo[]>([]);
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(true);

  // 1. Initial State Restoration from localStorage & API
  useEffect(() => {
    // Check if session token exists
    const token = sessionStorage.getItem("automester_session_token");
    if (token) {
      setIsLocked(false);
    } else {
      setIsLocked(true);
    }

    async function init() {
      try {
        // Fetch users
        const usersRes = await fetch("/api/users");
        if (usersRes.ok) {
          const users = await usersRes.json();
          setAvailableUsers(users);

          // Restore saved user ID from localStorage
          const savedUserId = localStorage.getItem("automester_user_id");
          const found = users.find((u: any) => u.id === savedUserId);
          if (found) setCurrentUserState(found);
          else if (users.length > 0) setCurrentUserState(users[0]);
        }

        // Fetch branches
        const branchRes = await fetch("/api/branches");
        if (branchRes.ok) {
          const branches = await branchRes.json();
          setAvailableBranches(branches);

          // Restore saved branch ID from localStorage
          const savedBranchId = localStorage.getItem("automester_branch_id");
          const foundB = branches.find((b: any) => b.id === savedBranchId);
          if (foundB) setCurrentBranchState(foundB);
          else if (branches.length > 0) setCurrentBranchState(branches[0]);
        }

        // Restore active timers with real-time recalculation
        const savedTimersJson = localStorage.getItem("automester_active_timers");
        if (savedTimersJson) {
          try {
            const parsed: ActiveTimer[] = JSON.parse(savedTimersJson);
            const now = Date.now();
            const updated = parsed.map((t) => {
              const start = new Date(t.startTime).getTime();
              const elapsed = Math.max(0, Math.floor((now - start) / 1000));
              return { ...t, elapsedSeconds: elapsed };
            });
            setActiveTimers(updated);
          } catch (e) {
            console.error("Error parsing timers", e);
          }
        }
      } catch (e) {
        console.error("Failed to initialize workshop context", e);
      }
    }

    init();
  }, []);

  // 2. Persist State Changes to localStorage
  const setCurrentUser = (u: CurrentUser) => {
    setCurrentUserState(u);
    localStorage.setItem("automester_user_id", u.id);
  };

  const setCurrentBranch = (b: BranchInfo) => {
    setCurrentBranchState(b);
    localStorage.setItem("automester_branch_id", b.id);
  };

  const lockApp = () => {
    sessionStorage.removeItem("automester_session_token");
    setIsLocked(true);
  };

  const unlockApp = () => {
    setIsLocked(false);
  };

  // 3. Live Stopwatch Interval (1 second tick + persistence)
  useEffect(() => {
    if (activeTimers.length === 0) return;

    const interval = setInterval(() => {
      setActiveTimers((prev) => {
        const now = Date.now();
        const updated = prev.map((t) => {
          const start = new Date(t.startTime).getTime();
          const elapsed = Math.max(0, Math.floor((now - start) / 1000));
          return { ...t, elapsedSeconds: elapsed };
        });
        localStorage.setItem("automester_active_timers", JSON.stringify(updated));
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers.length]);

  // 4. Daily 13:00 Auto-Backup Scheduled Checker
  useEffect(() => {
    const checkSchedule = async () => {
      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toISOString().split("T")[0];
      const lastBackupDone = localStorage.getItem("automester_last_daily_backup_date");

      if (currentHour >= 13 && lastBackupDone !== todayStr) {
        console.log("Triggering daily 13:00 auto-backup...");
        try {
          const res = await fetch("/api/backup/schedule", { method: "POST" });
          if (res.ok) {
            localStorage.setItem("automester_last_daily_backup_date", todayStr);
            addNotification("✅ Napi 13:00-s automatikus biztonsági mentés sikeresen lefutott!");
          }
        } catch (e) {
          console.error("Auto-backup failed", e);
        }
      }
    };

    const interval = setInterval(checkSchedule, 60000); // check every minute
    checkSchedule();

    return () => clearInterval(interval);
  }, []);

  const startTimer = async (workOrderId: string, orderNumber: string, licensePlate: string) => {
    const newTimer: ActiveTimer = {
      workOrderId,
      orderNumber,
      licensePlate,
      mechanicId: currentUser.id,
      mechanicName: currentUser.name,
      startTime: new Date().toISOString(),
      elapsedSeconds: 0,
    };

    const updated = [...activeTimers.filter((t) => t.workOrderId !== workOrderId), newTimer];
    setActiveTimers(updated);
    localStorage.setItem("automester_active_timers", JSON.stringify(updated));

    // Also notify backend API
    try {
      await fetch("/api/timelogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workOrderId,
          workerId: currentUser.id,
          startTime: newTimer.startTime,
        }),
      });
    } catch (e) {
      console.error("Failed to save timelog start", e);
    }
  };

  const stopTimer = async (workOrderId: string) => {
    const timer = activeTimers.find((t) => t.workOrderId === workOrderId);
    const updated = activeTimers.filter((t) => t.workOrderId !== workOrderId);
    setActiveTimers(updated);
    localStorage.setItem("automester_active_timers", JSON.stringify(updated));

    if (timer) {
      try {
        const hours = Number((timer.elapsedSeconds / 3600).toFixed(2));
        await fetch("/api/timelogs/active", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workOrderId,
            elapsedSeconds: timer.elapsedSeconds,
            hours,
          }),
        });
      } catch (e) {
        console.error("Failed to stop timelog", e);
      }
    }
  };

  const addNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev.slice(0, 19)]);
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
        isLocked,
        lockApp,
        unlockApp,
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
}

export function useWorkshop() {
  return useContext(WorkshopContext);
}
