import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getMatchRef } from "@/lib/matches";
import { setInProgress, clearInProgress } from "@/lib/repo/matchState";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const matchId: string = body?.matchId;
  const inProgress: boolean = body?.inProgress;

  if (!matchId || typeof inProgress !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const match = await getMatchRef(matchId);
  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
  }

  if (inProgress) {
    await setInProgress(matchId);
  } else {
    await clearInProgress(matchId);
  }

  return NextResponse.json({ ok: true });
}
