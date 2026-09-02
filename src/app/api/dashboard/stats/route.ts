import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");

  try {
    const [workOrders, customersCount, vehiclesCount, parts, invoices] = await Promise.all([
      prisma.workOrder.findMany({
        where: branchId ? { branchId } : undefined,
        include: { vehicle: true, customer: true, items: true, mechanic: true },
      }),
      prisma.customer.count(),
      prisma.vehicle.count(),
      prisma.part.findMany(),
      prisma.invoice.findMany(),
    ]);

    const activeCarsInShop = workOrders.filter(w => !["DELIVERED", "CANCELLED"].includes(w.status)).length;
    const readyForPickup = workOrders.filter(w => w.status === "READY").length;
    const inProgressCount = workOrders.filter(w => w.status === "IN_PROGRESS").length;
    const quotePendingCount = workOrders.filter(w => w.status === "QUOTE_PENDING").length;

    const totalGrossRevenue = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.totalGross, 0);
    const totalNetRevenue = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.totalNet, 0);
    const pendingPaymentGross = invoices.filter(i => i.status === "ISSUED" || i.status === "OVERDUE").reduce((sum, i) => sum + i.totalGross, 0);

    const lowStockCount = parts.filter(p => p.stockQuantity <= p.minStockQuantity).length;

    return NextResponse.json({
      activeCarsInShop,
      readyForPickup,
      inProgressCount,
      quotePendingCount,
      customersCount,
      vehiclesCount,
      totalGrossRevenue,
      totalNetRevenue,
      pendingPaymentGross,
      lowStockCount,
      recentWorkOrders: workOrders.slice(0, 6),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
