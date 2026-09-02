import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { action, workOrderId, workerId, notes } = await req.json();

    if (action === "START") {
      await prisma.timeLog.updateMany({
        where: { workOrderId, workerId, isRunning: true },
        data: { isRunning: false, endTime: new Date() },
      });

      const log = await prisma.timeLog.create({
        data: {
          workOrderId,
          workerId,
          startTime: new Date(),
          isRunning: true,
          notes: notes || "Munka elindítva",
        },
      });
      return NextResponse.json(log);
    } else if (action === "STOP") {
      const activeLogs = await prisma.timeLog.findMany({
        where: { workOrderId, workerId, isRunning: true },
      });

      for (const log of activeLogs) {
        const endTime = new Date();
        const durationMinutes = Math.max(1, Math.round((endTime.getTime() - new Date(log.startTime).getTime()) / 60000));
        await prisma.timeLog.update({
          where: { id: log.id },
          data: {
            isRunning: false,
            endTime,
            durationMinutes,
            notes: notes || log.notes,
          },
        });
      }

      const allLogs = await prisma.timeLog.findMany({ where: { workOrderId } });
      const totalMinutes = allLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const actualHours = Number((totalMinutes / 60).toFixed(2));

      await prisma.workOrder.update({
        where: { id: workOrderId },
        data: { actualHours },
      });

      return NextResponse.json({ success: true, actualHours });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to handle time log" }, { status: 500 });
  }
}
