import { NextResponse } from "next/server";
import { decodeVinBasic } from "@/lib/vinDecoder";

export async function POST(req: Request) {
  try {
    const { vin } = await req.json();
    if (!vin) return NextResponse.json({ error: "VIN is required" }, { status: 400 });
    const result = decodeVinBasic(vin);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to decode VIN" }, { status: 500 });
  }
}
