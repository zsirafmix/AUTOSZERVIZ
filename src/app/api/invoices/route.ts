import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const invoices = await prisma.invoice.findMany({
      where: status ? { status } : undefined,
      include: {
        customer: true,
        workOrder: {
          include: { vehicle: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.invoice.count();
    const invoiceNumber = `SZ-${new Date().getFullYear()}-${String(count + 140).padStart(4, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        workOrderId: body.workOrderId || null,
        customerId: body.customerId,
        type: body.type || "INVOICE",
        status: body.status || "PAID",
        paymentMethod: body.paymentMethod || "CARD",
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        fulfillmentDate: body.fulfillmentDate ? new Date(body.fulfillmentDate) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
        paidDate: body.status === "PAID" ? new Date() : null,
        totalNet: Number(body.totalNet || 0),
        totalVat: Number(body.totalVat || 0),
        totalGross: Number(body.totalGross || 0),
        itemsJson: typeof body.items === "string" ? body.items : JSON.stringify(body.items || []),
        notes: body.notes || null,
        billingoId: `BILL-${invoiceNumber}`,
        szamlazzHuId: `SZAMLA-${invoiceNumber}`,
      },
      include: {
        customer: true,
      }
    });

    if (body.workOrderId) {
      await prisma.workOrder.update({
        where: { id: body.workOrderId },
        data: { status: "DELIVERED", deliveredAt: new Date() },
      });
    }

    await logAuditAction({
      action: "CREATE",
      entityType: "Invoice",
      entityId: invoice.id,
      description: `Számla kiállítva: ${invoice.invoiceNumber} (${invoice.totalGross.toLocaleString()} Ft)`,
    });

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
