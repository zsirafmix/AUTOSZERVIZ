import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const lowStock = searchParams.get("lowStock") === "true";
  const category = searchParams.get("category");

  try {
    const parts = await prisma.part.findMany({
      where: {
        category: category ? category : undefined,
        OR: search ? [
          { partNumber: { contains: search } },
          { name: { contains: search } },
          { manufacturer: { contains: search } },
          { shelfLocation: { contains: search } },
          { oemNumber: { contains: search } },
        ] : undefined,
      },
      include: {
        supplier: true,
      },
      orderBy: { name: "asc" },
    });

    const filtered = lowStock ? parts.filter(p => p.stockQuantity <= p.minStockQuantity) : parts;
    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const part = await prisma.part.create({
      data: {
        partNumber: body.partNumber.trim().toUpperCase(),
        oemNumber: body.oemNumber ? body.oemNumber.trim().toUpperCase() : null,
        name: body.name,
        category: body.category || "Egyéb",
        manufacturer: body.manufacturer || "Utángyártott",
        purchasePriceNet: Number(body.purchasePriceNet || 0),
        sellingPriceNet: Number(body.sellingPriceNet || 0),
        vatRate: Number(body.vatRate || 27),
        stockQuantity: Number(body.stockQuantity || 0),
        minStockQuantity: Number(body.minStockQuantity || 2),
        shelfLocation: body.shelfLocation || "A-01-01",
        supplierId: body.supplierId || null,
        notes: body.notes || null,
      },
    });

    await logAuditAction({
      action: "CREATE",
      entityType: "Part",
      entityId: part.id,
      description: `Új alkatrész cikkszám felvéve: ${part.partNumber} (${part.name})`,
    });

    return NextResponse.json(part);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create part" }, { status: 500 });
  }
}
