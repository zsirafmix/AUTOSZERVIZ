import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      include: { branch: true },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Név és e-mail cím megadása kötelező" }, { status: 400 });
    }

    let branchId = body.branchId;
    if (!branchId) {
      const mainBranch = await prisma.branch.findFirst();
      branchId = mainBranch?.id || null;
    }

    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role || "MECHANIC",
        phone: body.phone || null,
        pinCode: body.pinCode || null,
        branchId: branchId,
        isActive: true,
      },
      include: { branch: true },
    });

    return NextResponse.json(newUser);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Ez az e-mail cím már foglalt!" }, { status: 400 });
    }
    return NextResponse.json({ error: "Hiba a munkatárs létrehozásakor" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Felhasználó ID szükséges" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: body.id },
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        phone: body.phone || null,
        pinCode: body.pinCode || null,
        branchId: body.branchId,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
      include: { branch: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: "Hiba a módosítás során" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID szükséges" }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Nem sikerült törölni a felhasználót" }, { status: 500 });
  }
}
