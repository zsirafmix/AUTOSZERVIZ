import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        vehicles: {
          include: {
            workOrders: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        workOrders: {
          include: {
            vehicle: true,
            invoices: true,
          },
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          orderBy: { startTime: "desc" },
        },
      },
    });

    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const updated = await prisma.customer.update({
      where: { id: params.id },
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
      action: "UPDATE",
      entityType: "Customer",
      entityId: params.id,
      description: `Ügyfél adatok frissítve: ${updated.name}`,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}
