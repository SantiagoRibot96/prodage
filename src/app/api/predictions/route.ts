import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getMatchRef } from "@/lib/matches";
import { getResult } from "@/lib/repo/results";
import { isInProgress } from "@/lib/repo/matchState";
import { createPrediction } from "@/lib/repo/predictions";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const matchId = body?.matchId;
  const predictedWinnerId = body?.predictedWinnerId;
  const predictedScore = body?.predictedScore;

  if (!matchId || !predictedWinnerId || !["2-0", "2-1"].includes(predictedScore)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const match = await getMatchRef(matchId);
  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
  }
  if (![match.playerAId, match.playerBId].includes(predictedWinnerId)) {
    return NextResponse.json({ error: "Ese jugador no juega este partido." }, { status: 400 });
  }

  const existingResult = await getResult(matchId);
  if (existingResult) {
    return NextResponse.json(
      { error: "Ya se cargó el resultado de este partido, no se puede pronosticar." },
      { status: 409 }
    );
  }

  if (await isInProgress(matchId)) {
    return NextResponse.json(
      { error: "La partida está en curso: los pronósticos para este partido están cerrados." },
      { status: 409 }
    );
  }

  try {
    const prediction = await createPrediction({
      matchId,
      userId: user.id,
      predictedWinnerId,
      predictedScore,
    });
    return NextResponse.json({ ok: true, prediction });
  } catch (err: any) {
    if (err?.message === "ALREADY_PREDICTED") {
      return NextResponse.json(
        { error: "Ya hiciste tu pronóstico para este partido: no se puede modificar." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "No se pudo guardar el pronóstico." }, { status: 500 });
  }
}
