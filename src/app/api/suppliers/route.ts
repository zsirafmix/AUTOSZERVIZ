import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        parts: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supplier = await prisma.supplier.create({
      data: {
        name: body.name,
        code: body.code ? body.code.toUpperCase() : null,
        contactPerson: body.contactPerson || null,
        email: body.email || null,
        phone: body.phone || null,
        website: body.website || null,
        apiType: body.apiType || "MANUAL",
        discountRate: Number(body.discountRate || 0),
        notes: body.notes || null,
      },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
