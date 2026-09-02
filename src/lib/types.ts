export type FeatureFlagKey =
  | "crm"
  | "vehicles"
  | "calendar"
  | "work_orders"
  | "inspections"
  | "quotes"
  | "inventory"
  | "suppliers"
  | "time_tracking"
  | "invoicing"
  | "reminders"
  | "customer_portal"
  | "live_tracking"
  | "warranties"
  | "multi_branch"
  | "ai_assistant";

export interface FeatureFlagItem {
  id: string;
  key: FeatureFlagKey;
  label: string;
  description: string;
  category: "core" | "workshop" | "finance" | "smart";
  isEnabled: boolean;
  sortOrder: number;
}

export type UserRole = "ADMIN" | "RECEPTIONIST" | "MECHANIC" | "WAREHOUSE" | "ACCOUNTANT" | "CUSTOMER";

export interface DamagePoint {
  id: string;
  x: number; // 0-100 %
  y: number; // 0-100 %
  view: "top" | "front" | "rear" | "left" | "right";
  type: "SCRATCH" | "DENT" | "CRACK" | "RUST" | "STONE_CHIP" | "OTHER";
  severity: "LIGHT" | "MEDIUM" | "SEVERE";
  note?: string;
  photoUrl?: string;
}

export interface InspectionChecklist {
  brakes?: { status: "GOOD" | "WARNING" | "CRITICAL"; notes?: string; thicknessMm?: number };
  tires?: { status: "GOOD" | "WARNING" | "CRITICAL"; notes?: string; depthMm?: number; pressureBar?: number };
  lights?: { status: "GOOD" | "WARNING" | "CRITICAL"; notes?: string };
  fluids?: { status: "GOOD" | "WARNING" | "CRITICAL"; notes?: string; coolantTempC?: number; brakeFluidBoilC?: number };
  battery?: { status: "GOOD" | "WARNING" | "CRITICAL"; notes?: string; voltage?: number; healthPercent?: number };
  suspension?: { status: "GOOD" | "WARNING" | "CRITICAL"; notes?: string };
  exhaust?: { status: "GOOD" | "WARNING" | "CRITICAL"; notes?: string };
  wipers?: { status: "GOOD" | "WARNING" | "CRITICAL"; notes?: string };
  interior?: { status: "GOOD" | "WARNING" | "CRITICAL"; notes?: string };
}
