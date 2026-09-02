import { NextResponse } from "next/server";
import { generateAIDiagnosis } from "@/lib/aiService";

export async function POST(req: Request) {
  try {
    const { rawNotes, vehicleInfo } = await req.json();
    if (!rawNotes) return NextResponse.json({ error: "Nyers hibaleírás megadása kötelező" }, { status: 400 });
    const suggestion = generateAIDiagnosis(rawNotes, vehicleInfo);
    return NextResponse.json(suggestion);
  } catch (error) {
    return NextResponse.json({ error: "AI diagnosztikai hiba" }, { status: 500 });
  }
}
