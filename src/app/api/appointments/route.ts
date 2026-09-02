import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");

  try {
    const appointments = await prisma.appointment.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        customer: true,
        vehicle: true,
        mechanic: true,
      },
      orderBy: { startTime: "asc" },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const appt = await prisma.appointment.create({
      data: {
        branchId: body.branchId,
        customerId: body.customerId || null,
        vehicleId: body.vehicleId || null,
        mechanicId: body.mechanicId || null,
        bayNumber: Number(body.bayNumber || 1),
        title: body.title,
        serviceType: body.serviceType || "GENERAL_SERVICE",
        clientName: body.clientName || null,
        clientPhone: body.clientPhone || null,
        clientEmail: body.clientEmail || null,
        vehiclePlate: body.vehiclePlate ? body.vehiclePlate.toUpperCase() : null,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: body.status || "CONFIRMED",
        customerNotes: body.customerNotes || null,
        internalNotes: body.internalNotes || null,
        isOnlineBooking: Boolean(body.isOnlineBooking),
      },
      include: {
        customer: true,
        vehicle: true,
        mechanic: true,
      }
    });
    return NextResponse.json(appt);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
