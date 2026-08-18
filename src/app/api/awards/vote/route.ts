import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { AWARD_CATEGORY_KEYS } from "@/lib/data/awards";
import { PLAYERS_BY_ID } from "@/lib/data/players";
import { createVote, getState } from "@/lib/repo/awards";
import type { AwardCategory } from "@/lib/types";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
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

  const state = await getState(category);
  if (state.closed) {
    return NextResponse.json({ error: "La votación de esta categoría está cerrada." }, { status: 409 });
  }

  try {
    const vote = await createVote({ category, userId: user.id, playerId });
    return NextResponse.json({ ok: true, vote });
  } catch (err: any) {
    if (err?.message === "ALREADY_VOTED") {
      return NextResponse.json(
        { error: "Ya votaste en esta categoría: no se puede cambiar." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "No se pudo registrar el voto." }, { status: 500 });
  }
}
