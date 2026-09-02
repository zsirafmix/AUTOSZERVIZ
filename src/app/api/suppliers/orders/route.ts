import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.supplierOrder.findMany({
      include: {
        supplier: true,
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch supplier orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.supplierOrder.count();
    const orderNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const order = await prisma.supplierOrder.create({
      data: {
        orderNumber,
        supplierId: body.supplierId,
        branchId: body.branchId || null,
        status: body.status || "ORDERED",
        itemsJson: typeof body.items === "string" ? body.items : JSON.stringify(body.items || []),
        totalAmountNet: Number(body.totalAmountNet || 0),
        estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : null,
        notes: body.notes || null,
      },
      include: { supplier: true }
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create supplier order" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await prisma.supplierOrder.update({
      where: { id: body.id },
      data: {
        status: body.status,
        arrivedAt: body.status === "ARRIVED" ? new Date() : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update supplier order" }, { status: 500 });
  }
}
