"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { FeatureFlagItem, FeatureFlagKey } from "@/lib/types";

interface FeatureFlagContextType {
  flags: Record<FeatureFlagKey, boolean>;
  flagList: FeatureFlagItem[];
  isLoading: boolean;
  isFeatureEnabled: (key: FeatureFlagKey) => boolean;
  toggleFlag: (key: FeatureFlagKey, isEnabled: boolean) => Promise<void>;
  refreshFlags: () => Promise<void>;
}

const defaultFlags: Record<FeatureFlagKey, boolean> = {
  crm: true,
  vehicles: true,
  calendar: true,
  work_orders: true,
  inspections: true,
  quotes: true,
  inventory: true,
  suppliers: true,
  time_tracking: true,
  invoicing: true,
  reminders: true,
  customer_portal: true,
  live_tracking: true,
  warranties: true,
  multi_branch: true,
  ai_assistant: true,
};

const FeatureFlagContext = createContext<FeatureFlagContextType>({
  flags: defaultFlags,
  flagList: [],
  isLoading: true,
  isFeatureEnabled: () => true,
  toggleFlag: async () => {},
  refreshFlags: async () => {},
});

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<Record<FeatureFlagKey, boolean>>(defaultFlags);
  const [flagList, setFlagList] = useState<FeatureFlagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const res = await fetch("/api/feature-flags");
      if (res.ok) {
        const data = await res.json();
        setFlagList(data);
        const map: Partial<Record<FeatureFlagKey, boolean>> = {};
        data.forEach((item: FeatureFlagItem) => {
          map[item.key] = item.isEnabled;
        });
        setFlags((prev) => ({ ...prev, ...map }));
      }
    } catch (e) {
      console.error("Failed to load feature flags", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const isFeatureEnabled = (key: FeatureFlagKey): boolean => {
    return flags[key] ?? true;
  };

  const toggleFlag = async (key: FeatureFlagKey, isEnabled: boolean) => {
    // Optimistic UI update
    setFlags((prev) => ({ ...prev, [key]: isEnabled }));
    setFlagList((prev) =>
      prev.map((f) => (f.key === key ? { ...f, isEnabled } : f))
    );

    try {
      await fetch("/api/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, isEnabled }),
      });
    } catch (e) {
      console.error("Failed to toggle flag", e);
      // Revert on error
      fetchFlags();
    }
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        flags,
        flagList,
        isLoading,
        isFeatureEnabled,
        toggleFlag,
        refreshFlags: fetchFlags,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}
