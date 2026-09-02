import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const branchId = searchParams.get("branchId");
  const mechanicId = searchParams.get("mechanicId");
  const search = searchParams.get("search");

  try {
    const workOrders = await prisma.workOrder.findMany({
      where: {
        status: status ? status : undefined,
        branchId: branchId ? branchId : undefined,
        mechanicId: mechanicId ? mechanicId : undefined,
        OR: search ? [
          { orderNumber: { contains: search } },
          { customer: { name: { contains: search } } },
          { customer: { phone: { contains: search } } },
          { vehicle: { licensePlate: { contains: search } } },
          { vehicle: { brand: { contains: search } } },
          { issueDescription: { contains: search } },
        ] : undefined,
      },
      include: {
        customer: true,
        vehicle: true,
        mechanic: true,
        branch: true,
        items: true,
        invoices: true,
        timeLogs: {
          where: { isRunning: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(workOrders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch work orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Auto generate order number ML-YYYY-XXXX
    const count = await prisma.workOrder.count();
    const currentYear = new Date().getFullYear();
    const orderNumber = `ML-${currentYear}-${String(count + 101).padStart(4, "0")}`;
    const trackingToken = `tk_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;

    const workOrder = await prisma.workOrder.create({
      data: {
        orderNumber,
        branchId: body.branchId,
        customerId: body.customerId,
        vehicleId: body.vehicleId,
        mechanicId: body.mechanicId || null,
        status: body.status || "CHECK_IN",
        priority: body.priority || "NORMAL",
        issueDescription: body.issueDescription,
        diagnosis: body.diagnosis || null,
        internalNotes: body.internalNotes || null,
        publicNotes: body.publicNotes || null,
        mileageAtService: body.mileageAtService ? Number(body.mileageAtService) : null,
        fuelLevel: body.fuelLevel ? Number(body.fuelLevel) : 50,
        trackingToken,
        quoteStatus: body.quoteStatus || "DRAFT",
        laborCostNet: Number(body.laborCostNet || 0),
        partsCostNet: Number(body.partsCostNet || 0),
        totalNet: Number(body.totalNet || 0),
        totalVat: Number(body.totalVat || 0),
        totalGross: Number(body.totalGross || 0),
        estimatedHours: Number(body.estimatedHours || 0),
        warrantyPartsMonths: Number(body.warrantyPartsMonths || 12),
        warrantyLaborMonths: Number(body.warrantyLaborMonths || 6),
      },
      include: {
        customer: true,
        vehicle: true,
      }
    });

    // Update vehicle mileage if provided
    if (body.mileageAtService) {
      await prisma.vehicle.update({
        where: { id: body.vehicleId },
        data: { mileage: Number(body.mileageAtService) },
      });
    }

    await logAuditAction({
      action: "CREATE",
      entityType: "WorkOrder",
      entityId: workOrder.id,
      description: `Új munkalap nyitva: ${workOrder.orderNumber} - ${workOrder.vehicle.licensePlate} (${workOrder.customer.name})`,
    });

    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("Error creating work order:", error);
    return NextResponse.json({ error: "Failed to create work order" }, { status: 500 });
  }
}
