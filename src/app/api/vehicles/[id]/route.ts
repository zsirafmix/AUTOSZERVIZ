import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        workOrders: {
          include: {
            items: true,
            mechanic: true,
            invoices: true,
          },
          orderBy: { createdAt: "desc" },
        },
        inspections: {
          orderBy: { createdAt: "desc" },
        },
        reminders: {
          orderBy: { targetDate: "asc" },
        },
      },
    });

    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json();
    const updated = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        licensePlate: body.licensePlate?.toUpperCase().trim(),
        vin: body.vin ? body.vin.toUpperCase().trim() : null,
        brand: body.brand,
        model: body.model,
        year: body.year ? Number(body.year) : null,
        engineCode: body.engineCode || null,
        displacementCc: body.displacementCc ? Number(body.displacementCc) : null,
        powerKw: body.powerKw ? Number(body.powerKw) : null,
        powerHp: body.powerHp ? Number(body.powerHp) : null,
        fuelType: body.fuelType,
        transmission: body.transmission,
        color: body.color || null,
        mileage: Number(body.mileage || 0),
        motExpiry: body.motExpiry ? new Date(body.motExpiry) : null,
        insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
        tireSize: body.tireSize || null,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}
