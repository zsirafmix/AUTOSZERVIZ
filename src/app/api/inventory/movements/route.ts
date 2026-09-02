import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: {
        part: true,
        workOrder: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(movements);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stock movements" }, { status: 500 });
  }
}
