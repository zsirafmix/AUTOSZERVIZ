import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");
  const workOrderId = searchParams.get("workOrderId");

  try {
    const inspections = await prisma.inspection.findMany({
      where: {
        vehicleId: vehicleId ? vehicleId : undefined,
        workOrderId: workOrderId ? workOrderId : undefined,
      },
      include: {
        vehicle: true,
        workOrder: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inspections);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inspection = await prisma.inspection.create({
      data: {
        workOrderId: body.workOrderId || null,
        vehicleId: body.vehicleId,
        inspectorName: body.inspectorName || "Műhelyvezető",
        odometer: body.odometer ? Number(body.odometer) : null,
        fuelLevelPercent: body.fuelLevelPercent ? Number(body.fuelLevelPercent) : 50,
        damagePointsJson: typeof body.damagePoints === "string" ? body.damagePoints : JSON.stringify(body.damagePoints || []),
        checklistJson: typeof body.checklist === "string" ? body.checklist : JSON.stringify(body.checklist || {}),
        overallStatus: body.overallStatus || "GOOD",
        summaryNotes: body.summaryNotes || null,
        photosJson: typeof body.photos === "string" ? body.photos : JSON.stringify(body.photos || []),
        signatureCustomer: body.signatureCustomer || null,
        signatureInspector: body.signatureInspector || null,
      },
    });

    await logAuditAction({
      action: "CREATE",
      entityType: "Inspection",
      entityId: inspection.id,
      description: `Digitális állapotfelmérés rögzítve (${inspection.overallStatus})`,
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Error creating inspection:", error);
    return NextResponse.json({ error: "Failed to create inspection" }, { status: 500 });
  }
}
