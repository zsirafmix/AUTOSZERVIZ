import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: search ? {
        OR: [
          { licensePlate: { contains: search } },
          { vin: { contains: search } },
          { brand: { contains: search } },
          { model: { contains: search } },
          { customer: { name: { contains: search } } },
        ],
      } : undefined,
      include: {
        customer: true,
        workOrders: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const vehicle = await prisma.vehicle.create({
      data: {
        customerId: body.customerId,
        licensePlate: body.licensePlate.toUpperCase().trim(),
        vin: body.vin ? body.vin.toUpperCase().trim() : null,
        brand: body.brand,
        model: body.model,
        year: body.year ? Number(body.year) : null,
        engineCode: body.engineCode || null,
        displacementCc: body.displacementCc ? Number(body.displacementCc) : null,
        powerKw: body.powerKw ? Number(body.powerKw) : null,
        powerHp: body.powerHp ? Number(body.powerHp) : null,
        fuelType: body.fuelType || "Petrol",
        transmission: body.transmission || "Manual",
        color: body.color || null,
        mileage: Number(body.mileage || 0),
        motExpiry: body.motExpiry ? new Date(body.motExpiry) : null,
        insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
        tireSize: body.tireSize || null,
        notes: body.notes || null,
      },
    });

    await logAuditAction({
      action: "CREATE",
      entityType: "Vehicle",
      entityId: vehicle.id,
      description: `Új jármű rögzítve: ${vehicle.licensePlate} (${vehicle.brand} ${vehicle.model})`,
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
