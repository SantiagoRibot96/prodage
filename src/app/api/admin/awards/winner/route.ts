import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { AWARD_CATEGORY_KEYS } from "@/lib/data/awards";
import { PLAYERS_BY_ID } from "@/lib/data/players";
import { declareWinner } from "@/lib/repo/awards";
import type { AwardCategory } from "@/lib/types";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const category: AwardCategory = body?.category;
  const playerId: string = body?.playerId;

  if (!AWARD_CATEGORY_KEYS.includes(category)) {
    return NextResponse.json({ error: "Categoría inválida." }, { status: 400 });
  }
  if (!playerId || !PLAYERS_BY_ID[playerId]) {
    return NextResponse.json({ error: "Elegí un jugador válido." }, { status: 400 });
  }

  const state = await declareWinner(category, playerId);
  return NextResponse.json({ ok: true, state });
}
