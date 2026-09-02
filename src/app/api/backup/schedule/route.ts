import { NextResponse } from "next/server";
import { generateEncryptedBackup, listServerBackups } from "@/lib/backupService";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    // Check last backup
    const backups = listServerBackups();
    const lastBackup = backups[0];

    return NextResponse.json({
      scheduledHour: 13,
      currentServerTime: now.toISOString(),
      currentHour,
      lastBackupDate: lastBackup?.createdAt || null,
      totalBackupsOnServer: backups.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const backup = await generateEncryptedBackup("admin");
    return NextResponse.json({
      success: true,
      message: "Napi automatikus mentés (13:00) sikeresen lefutott!",
      filename: backup.filename,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
