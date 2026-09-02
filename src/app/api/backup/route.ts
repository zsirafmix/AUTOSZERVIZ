import { NextResponse } from "next/server";
import {
  generateEncryptedBackup,
  restoreDatabaseDump,
  listServerBackups
} from "@/lib/backupService";
import { decryptData } from "@/lib/encryption";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const password = searchParams.get("password") || "admin";

    if (action === "list") {
      const list = listServerBackups();
      return NextResponse.json(list);
    }

    // Default: generate fresh encrypted backup for immediate download
    const backup = await generateEncryptedBackup(password);
    return NextResponse.json(backup);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Mentési hiba" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = body.password || "admin";

    const backup = await generateEncryptedBackup(password);

    await logAuditAction({
      action: "CREATE",
      entityType: "System",
      entityId: "backup",
      description: `AES-256 titkosított biztonsági mentés létrehozva: ${backup.filename}`,
    });

    return NextResponse.json(backup);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Hiba a mentés során" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { encryptedData, password } = body;

    if (!encryptedData || !password) {
      return NextResponse.json({ error: "Titkosított adat és jelszó szükséges!" }, { status: 400 });
    }

    // 1. Decrypt AES-256 payload with password
    const decryptedJson = decryptData(encryptedData, password);

    // 2. Restore all database tables
    const meta = await restoreDatabaseDump(decryptedJson);

    await logAuditAction({
      action: "UPDATE",
      entityType: "System",
      entityId: "restore",
      description: `Sikeres adatbázis visszaállítás a mentésből (${meta.createdAt})`,
    });

    return NextResponse.json({ success: true, meta });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Sikertelen visszaállítás! Ellenőrizze a jelszót!" }, { status: 400 });
  }
}
