import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const qty = Number(body.quantity || 1);
    const priceNet = Number(body.unitPriceNet || 0);
    const vat = Number(body.vatRate || 27);
    const totalGross = Math.round(qty * priceNet * (1 + vat / 100));

    const item = await prisma.workOrderItem.create({
      data: {
        workOrderId: params.id,
        type: body.type || "LABOR",
        name: body.name,
        itemCode: body.itemCode || null,
        quantity: qty,
        unit: body.unit || "db",
        unitPriceNet: priceNet,
        vatRate: vat,
        totalGross: totalGross,
        partId: body.partId || null,
        isCompleted: Boolean(body.isCompleted),
        warrantyMonths: body.warrantyMonths ? Number(body.warrantyMonths) : 12,
      },
    });

    if (body.partId) {
      const part = await prisma.part.findUnique({ where: { id: body.partId } });
      if (part) {
        const newStock = Math.max(0, part.stockQuantity - Math.round(qty));
        await prisma.part.update({
          where: { id: body.partId },
          data: { stockQuantity: newStock },
        });

        await prisma.stockMovement.create({
          data: {
            partId: part.id,
            branchId: part.branchId,
            type: "WORK_ORDER",
            quantity: -Math.round(qty),
            previousStock: part.stockQuantity,
            newStock: newStock,
            unitPriceNet: part.purchasePriceNet,
            workOrderId: params.id,
            reason: `Munkalapra kiadva: ${body.name}`,
          },
        });
      }
    }

    await recalculateWorkOrderTotals(params.id);
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  try {
    const item = await prisma.workOrderItem.findUnique({ where: { id: itemId } });
    if (item && item.partId) {
      const part = await prisma.part.findUnique({ where: { id: item.partId } });
      if (part) {
        await prisma.part.update({
          where: { id: item.partId },
          data: { stockQuantity: part.stockQuantity + Math.round(item.quantity) },
        });
      }
    }

    await prisma.workOrderItem.delete({ where: { id: itemId } });
    await recalculateWorkOrderTotals(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

async function recalculateWorkOrderTotals(workOrderId: string) {
  const items = await prisma.workOrderItem.findMany({ where: { workOrderId } });
  let laborNet = 0;
  let partsNet = 0;
  let totalGross = 0;

  for (const it of items) {
    const subtotalNet = it.quantity * it.unitPriceNet;
    if (it.type === "LABOR") laborNet += subtotalNet;
    else partsNet += subtotalNet;
    totalGross += it.totalGross;
  }

  const totalNet = laborNet + partsNet;
  const totalVat = totalGross - totalNet;

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      laborCostNet: laborNet,
      partsCostNet: partsNet,
      totalNet: totalNet,
      totalVat: totalVat,
      totalGross: totalGross,
    },
  });
}
