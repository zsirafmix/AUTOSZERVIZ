import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { encryptData, decryptData } from "./encryption";

const BACKUP_DIR = path.join(process.cwd(), "backups");

// Ensures backup directory exists
export function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// Export all database tables into a single JSON dump object
export async function createDatabaseDump() {
  const [
    branches,
    users,
    customers,
    vehicles,
    workOrders,
    workOrderItems,
    inspections,
    parts,
    stockMovements,
    suppliers,
    supplierOrders,
    timeLogs,
    appointments,
    invoices,
    reminders,
    auditLogs,
    featureFlags,
    systemSettings,
  ] = await Promise.all([
    prisma.branch.findMany(),
    prisma.user.findMany(),
    prisma.customer.findMany(),
    prisma.vehicle.findMany(),
    prisma.workOrder.findMany(),
    prisma.workOrderItem.findMany(),
    prisma.inspection.findMany(),
    prisma.part.findMany(),
    prisma.stockMovement.findMany(),
    prisma.supplier.findMany(),
    prisma.supplierOrder.findMany(),
    prisma.timeLog.findMany(),
    prisma.appointment.findMany(),
    prisma.invoice.findMany(),
    prisma.reminder.findMany(),
    prisma.auditLog.findMany(),
    prisma.featureFlag.findMany(),
    prisma.systemSetting.findMany(),
  ]);

  return {
    meta: {
      appName: "AutoMester Pro ERP",
      version: "2.6-enterprise",
      createdAt: new Date().toISOString(),
      counts: {
        customers: customers.length,
        vehicles: vehicles.length,
        workOrders: workOrders.length,
        parts: parts.length,
        invoices: invoices.length,
      },
    },
    tables: {
      branches,
      users,
      customers,
      vehicles,
      workOrders,
      workOrderItems,
      inspections,
      parts,
      stockMovements,
      suppliers,
      supplierOrders,
      timeLogs,
      appointments,
      invoices,
      reminders,
      auditLogs,
      featureFlags,
      systemSettings,
    },
  };
}

// Generates encrypted backup, saves to disk and returns encrypted string
export async function generateEncryptedBackup(masterPassword = "admin") {
  ensureBackupDir();
  const dump = await createDatabaseDump();
  const encrypted = encryptData(JSON.stringify(dump), masterPassword);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `automester-backup-${timestamp}.autosafe`;
  const filePath = path.join(BACKUP_DIR, filename);

  fs.writeFileSync(filePath, encrypted, "utf8");

  return {
    filename,
    filePath,
    encryptedData: encrypted,
    meta: dump.meta,
  };
}

// Restores entire database from decrypted JSON dump
export async function restoreDatabaseDump(dumpJson: string) {
  const dump = JSON.parse(dumpJson);
  if (!dump.tables) {
    throw new Error("Érvénytelen mentési adatstruktúra!");
  }

  const { tables } = dump;

  // Transactionally restore all data
  await prisma.$transaction(async (tx) => {
    // 1. Clean existing records in reverse dependency order
    await tx.auditLog.deleteMany();
    await tx.timeLog.deleteMany();
    await tx.invoice.deleteMany();
    await tx.stockMovement.deleteMany();
    await tx.workOrderItem.deleteMany();
    await tx.inspection.deleteMany();
    await tx.workOrder.deleteMany();
    await tx.appointment.deleteMany();
    await tx.reminder.deleteMany();
    await tx.vehicle.deleteMany();
    await tx.customer.deleteMany();
    await tx.supplierOrder.deleteMany();
    await tx.part.deleteMany();
    await tx.supplier.deleteMany();
    await tx.featureFlag.deleteMany();
    await tx.systemSetting.deleteMany();
    await tx.user.deleteMany();
    await tx.branch.deleteMany();

    // 2. Insert restored data
    if (tables.branches?.length) await tx.branch.createMany({ data: tables.branches });
    if (tables.users?.length) await tx.user.createMany({ data: tables.users });
    if (tables.suppliers?.length) await tx.supplier.createMany({ data: tables.suppliers });
    if (tables.parts?.length) await tx.part.createMany({ data: tables.parts });
    if (tables.customers?.length) await tx.customer.createMany({ data: tables.customers });
    if (tables.vehicles?.length) await tx.vehicle.createMany({ data: tables.vehicles });
    if (tables.workOrders?.length) await tx.workOrder.createMany({ data: tables.workOrders });
    if (tables.workOrderItems?.length) await tx.workOrderItem.createMany({ data: tables.workOrderItems });
    if (tables.inspections?.length) await tx.inspection.createMany({ data: tables.inspections });
    if (tables.stockMovements?.length) await tx.stockMovement.createMany({ data: tables.stockMovements });
    if (tables.supplierOrders?.length) await tx.supplierOrder.createMany({ data: tables.supplierOrders });
    if (tables.timeLogs?.length) await tx.timeLog.createMany({ data: tables.timeLogs });
    if (tables.appointments?.length) await tx.appointment.createMany({ data: tables.appointments });
    if (tables.invoices?.length) await tx.invoice.createMany({ data: tables.invoices });
    if (tables.reminders?.length) await tx.reminder.createMany({ data: tables.reminders });
    if (tables.featureFlags?.length) await tx.featureFlag.createMany({ data: tables.featureFlags });
    if (tables.systemSettings?.length) await tx.systemSetting.createMany({ data: tables.systemSettings });
  });

  return dump.meta;
}

// List all backups stored on the server
export function listServerBackups() {
  ensureBackupDir();
  const files = fs.readdirSync(BACKUP_DIR);
  return files
    .filter((f) => f.endsWith(".autosafe"))
    .map((filename) => {
      const stats = fs.statSync(path.join(BACKUP_DIR, filename));
      return {
        filename,
        sizeBytes: stats.size,
        createdAt: stats.birthtime || stats.mtime,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
