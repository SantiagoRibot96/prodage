import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deletePrediction } from "@/lib/repo/predictions";

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  const userId = searchParams.get("userId");

  if (!matchId || !userId) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  await deletePrediction(matchId, userId);
  return NextResponse.json({ ok: true });
}
