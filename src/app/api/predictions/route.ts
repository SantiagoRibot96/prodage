import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getMatchRef } from "@/lib/matches";
import { getResult } from "@/lib/repo/results";
import { savePrediction } from "@/lib/repo/predictions";

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

  const prediction = await savePrediction({
    matchId,
    userId: user.id,
    predictedWinnerId,
    predictedScore,
  });

  return NextResponse.json({ ok: true, prediction });
}
