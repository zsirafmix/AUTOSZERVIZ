import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reminders = await prisma.reminder.findMany({
      include: {
        vehicle: true,
        customer: true,
      },
      orderBy: { targetDate: "asc" },
    });
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reminder = await prisma.reminder.create({
      data: {
        vehicleId: body.vehicleId,
        customerId: body.customerId,
        type: body.type || "OIL_CHANGE",
        title: body.title,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        targetMileage: body.targetMileage ? Number(body.targetMileage) : null,
        status: body.status || "PENDING",
        notificationMethod: body.notificationMethod || "EMAIL",
        notes: body.notes || null,
      },
      include: {
        vehicle: true,
        customer: true,
      }
    });
    return NextResponse.json(reminder);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
