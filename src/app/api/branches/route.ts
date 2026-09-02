import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { isMain: "desc" },
    });
    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}
