import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(flags);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feature flags" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { key, isEnabled } = await req.json();
    const updated = await prisma.featureFlag.update({
      where: { key },
      data: { isEnabled },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update feature flag" }, { status: 500 });
  }
}
