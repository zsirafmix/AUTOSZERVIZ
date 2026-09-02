import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const running = await prisma.timeLog.findMany({
      where: { isRunning: true },
      include: {
        worker: true,
        workOrder: {
          include: {
            vehicle: true,
            customer: true,
          },
        },
      },
    });

    const formatted = running.map(r => ({
      workOrderId: r.workOrderId,
      orderNumber: r.workOrder.orderNumber,
      licensePlate: r.workOrder.vehicle.licensePlate,
      mechanicId: r.workerId,
      mechanicName: r.worker.name,
      startTime: r.startTime.toISOString(),
      elapsedSeconds: Math.floor((Date.now() - new Date(r.startTime).getTime()) / 1000),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch active timers" }, { status: 500 });
  }
}
