import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        vehicle: true,
        mechanic: true,
        branch: true,
        items: {
          include: { part: true },
          orderBy: { createdAt: "asc" },
        },
        inspections: {
          orderBy: { createdAt: "desc" },
        },
        timeLogs: {
          include: { worker: true },
          orderBy: { startTime: "desc" },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!workOrder) return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    return NextResponse.json(workOrder);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch work order" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const existing = await prisma.workOrder.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

    const updated = await prisma.workOrder.update({
      where: { id: params.id },
      data: {
        status: body.status !== undefined ? body.status : existing.status,
        priority: body.priority !== undefined ? body.priority : existing.priority,
        mechanicId: body.mechanicId !== undefined ? body.mechanicId : existing.mechanicId,
        issueDescription: body.issueDescription !== undefined ? body.issueDescription : existing.issueDescription,
        diagnosis: body.diagnosis !== undefined ? body.diagnosis : existing.diagnosis,
        internalNotes: body.internalNotes !== undefined ? body.internalNotes : existing.internalNotes,
        publicNotes: body.publicNotes !== undefined ? body.publicNotes : existing.publicNotes,
        mileageAtService: body.mileageAtService !== undefined ? Number(body.mileageAtService) : existing.mileageAtService,
        fuelLevel: body.fuelLevel !== undefined ? Number(body.fuelLevel) : existing.fuelLevel,
        quoteStatus: body.quoteStatus !== undefined ? body.quoteStatus : existing.quoteStatus,
        quoteRejectReason: body.quoteRejectReason !== undefined ? body.quoteRejectReason : existing.quoteRejectReason,
        laborCostNet: body.laborCostNet !== undefined ? Number(body.laborCostNet) : existing.laborCostNet,
        partsCostNet: body.partsCostNet !== undefined ? Number(body.partsCostNet) : existing.partsCostNet,
        discountPercent: body.discountPercent !== undefined ? Number(body.discountPercent) : existing.discountPercent,
        totalNet: body.totalNet !== undefined ? Number(body.totalNet) : existing.totalNet,
        totalVat: body.totalVat !== undefined ? Number(body.totalVat) : existing.totalVat,
        totalGross: body.totalGross !== undefined ? Number(body.totalGross) : existing.totalGross,
        estimatedHours: body.estimatedHours !== undefined ? Number(body.estimatedHours) : existing.estimatedHours,
        actualHours: body.actualHours !== undefined ? Number(body.actualHours) : existing.actualHours,
        completedAt: body.status === "READY" && !existing.completedAt ? new Date() : existing.completedAt,
        deliveredAt: body.status === "DELIVERED" && !existing.deliveredAt ? new Date() : existing.deliveredAt,
      },
      include: {
        customer: true,
        vehicle: true,
        mechanic: true,
        items: true,
      },
    });

    if (body.status && body.status !== existing.status) {
      await logAuditAction({
        action: "STATUS_CHANGE",
        entityType: "WorkOrder",
        entityId: updated.id,
        oldValue: existing.status,
        newValue: body.status,
        description: `Munkalap státusza módosult: ${existing.status} ➔ ${body.status} (${updated.orderNumber})`,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update work order" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await prisma.workOrder.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete work order" }, { status: 500 });
  }
}
