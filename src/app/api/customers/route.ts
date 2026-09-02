import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  try {
    const customers = await prisma.customer.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
          { companyName: { contains: search } },
          { vehicles: { some: { licensePlate: { contains: search } } } },
        ],
      } : undefined,
      include: {
        vehicles: true,
        workOrders: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        isCompany: Boolean(body.isCompany),
        companyName: body.companyName || null,
        taxNumber: body.taxNumber || null,
        email: body.email || null,
        phone: body.phone,
        address: body.address || null,
        city: body.city || null,
        zip: body.zip || null,
        notes: body.notes || null,
        discountRate: Number(body.discountRate || 0),
      },
    });

    await logAuditAction({
      action: "CREATE",
      entityType: "Customer",
      entityId: customer.id,
      description: `Új ügyfél létrehozva: ${customer.name} (${customer.phone})`,
    });

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
