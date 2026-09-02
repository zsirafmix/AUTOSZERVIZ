import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const existing = await prisma.part.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Part not found" }, { status: 404 });

    const updated = await prisma.part.update({
      where: { id: params.id },
      data: {
        name: body.name !== undefined ? body.name : existing.name,
        category: body.category !== undefined ? body.category : existing.category,
        manufacturer: body.manufacturer !== undefined ? body.manufacturer : existing.manufacturer,
        purchasePriceNet: body.purchasePriceNet !== undefined ? Number(body.purchasePriceNet) : existing.purchasePriceNet,
        sellingPriceNet: body.sellingPriceNet !== undefined ? Number(body.sellingPriceNet) : existing.sellingPriceNet,
        stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : existing.stockQuantity,
        minStockQuantity: body.minStockQuantity !== undefined ? Number(body.minStockQuantity) : existing.minStockQuantity,
        shelfLocation: body.shelfLocation !== undefined ? body.shelfLocation : existing.shelfLocation,
        supplierId: body.supplierId !== undefined ? body.supplierId : existing.supplierId,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      },
    });

    if (body.sellingPriceNet && body.sellingPriceNet !== existing.sellingPriceNet) {
      await logAuditAction({
        action: "PRICE_CHANGE",
        entityType: "Part",
        entityId: updated.id,
        oldValue: `${existing.sellingPriceNet} Ft`,
        newValue: `${body.sellingPriceNet} Ft`,
        description: `${updated.name} eladási ára módosítva`,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update part" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await prisma.part.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete part" }, { status: 500 });
  }
}
