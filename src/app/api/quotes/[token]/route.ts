import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { trackingToken: params.token },
      include: {
        customer: true,
        vehicle: true,
        branch: true,
        items: true,
      },
    });

    if (!workOrder) return NextResponse.json({ error: "Árajánlat nem található vagy lejárt" }, { status: 404 });
    return NextResponse.json(workOrder);
  } catch (error) {
    return NextResponse.json({ error: "Hiba az árajánlat betöltésekor" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  try {
    const { action, signerName, signatureData, reason } = await req.json();
    const workOrder = await prisma.workOrder.findUnique({
      where: { trackingToken: params.token },
      include: { customer: true },
    });

    if (!workOrder) return NextResponse.json({ error: "Nem található munkalap" }, { status: 404 });

    let quoteStatus = "SENT";
    let newWorkOrderStatus = workOrder.status;

    if (action === "ACCEPT") {
      quoteStatus = "ACCEPTED";
      newWorkOrderStatus = "QUOTE_APPROVED";
    } else if (action === "REJECT") {
      quoteStatus = "REJECTED";
      newWorkOrderStatus = "CANCELLED";
    } else if (action === "CALL_REQUEST") {
      quoteStatus = "CALL_REQUESTED";
    }

    const updated = await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: {
        quoteStatus,
        status: newWorkOrderStatus,
        quoteAcceptedAt: action === "ACCEPT" ? new Date() : null,
        quoteAcceptedBy: signerName || workOrder.customer.name,
        quoteSignatureData: signatureData || null,
        quoteRejectReason: reason || null,
      },
    });

    await logAuditAction({
      action: "APPROVAL",
      entityType: "WorkOrder",
      entityId: workOrder.id,
      description: `Ügyfél online árajánlat válasz: ${quoteStatus} (${signerName || workOrder.customer.name})`,
    });

    return NextResponse.json({ success: true, quoteStatus, workOrder: updated });
  } catch (error) {
    return NextResponse.json({ error: "Sikertelen művelet" }, { status: 500 });
  }
}
