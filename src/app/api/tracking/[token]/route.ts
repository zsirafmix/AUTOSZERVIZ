import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { trackingToken: params.token },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        priority: true,
        issueDescription: true,
        publicNotes: true,
        laborCostNet: true,
        partsCostNet: true,
        totalGross: true,
        quoteStatus: true,
        scheduledStart: true,
        scheduledEnd: true,
        completedAt: true,
        deliveredAt: true,
        createdAt: true,
        updatedAt: true,
        vehicle: {
          select: {
            licensePlate: true,
            brand: true,
            model: true,
            year: true,
            color: true,
          },
        },
        branch: {
          select: {
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            type: true,
            quantity: true,
            unit: true,
            isCompleted: true,
          },
        },
      },
    });

    if (!workOrder) return NextResponse.json({ error: "Nem található szervizkövetési azonosító" }, { status: 404 });
    return NextResponse.json(workOrder);
  } catch (error) {
    return NextResponse.json({ error: "Hiba a követési adatok lekérésekor" }, { status: 500 });
  }
}
