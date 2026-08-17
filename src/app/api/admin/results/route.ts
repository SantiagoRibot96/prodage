import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getMatchRef } from "@/lib/matches";
import { getResult, saveResult, deleteResult } from "@/lib/repo/results";
import type { GameResult, MatchResult, MatchResultStatus, SeriesScore } from "@/lib/types";

function winsRequiredFor(score: SeriesScore) {
  return score === "2-0" ? { winner: 2, loser: 0 } : { winner: 2, loser: 1 };
}

export async function POST(req: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });

  const matchId: string = body.matchId;
  const status: MatchResultStatus = body.status;

  if (!matchId) return NextResponse.json({ error: "Falta el partido." }, { status: 400 });
  if (!["played", "admin_win", "no_contest"].includes(status)) {
    return NextResponse.json({ error: "Estado de resultado inválido." }, { status: 400 });
  }

  const match = await getMatchRef(matchId);
  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado (¿los playoffs ya se generaron?)." }, { status: 404 });
  }

  const players = [match.playerAId, match.playerBId];

  let winnerId: string | null = null;
  let score: SeriesScore | null = null;
  let games: GameResult[] = [];
  let bansA: string[] = Array.isArray(body.bansA) ? body.bansA.filter(Boolean) : [];
  let bansB: string[] = Array.isArray(body.bansB) ? body.bansB.filter(Boolean) : [];

  if (status !== "no_contest") {
    winnerId = body.winnerId;
    score = body.score;
    if (!winnerId || !players.includes(winnerId)) {
      return NextResponse.json({ error: "Elegí un ganador válido." }, { status: 400 });
    }
    if (!score || !["2-0", "2-1"].includes(score)) {
      return NextResponse.json({ error: "Elegí el marcador (2-0 o 2-1)." }, { status: 400 });
    }

    if (Array.isArray(body.games)) {
      games = body.games.map((g: any, idx: number): GameResult => ({
        gameNumber: (idx + 1) as 1 | 2 | 3,
        map: g.map,
        winnerId: g.winnerId,
        civA: g.civA,
        civB: g.civB,
      }));
    }

    if (status === "played") {
      const need = winsRequiredFor(score);
      const totalGames = need.winner + need.loser;
      if (games.length !== totalGames) {
        return NextResponse.json(
          { error: `Para un resultado ${score} hacen falta ${totalGames} mapas cargados.` },
          { status: 400 }
        );
      }
      for (const g of games) {
        if (!g.map || !players.includes(g.winnerId) || !g.civA || !g.civB) {
          return NextResponse.json(
            { error: "Completá mapa, ganador y civs de cada partida." },
            { status: 400 }
          );
        }
      }
      const winnerGameWins = games.filter((g) => g.winnerId === winnerId).length;
      if (winnerGameWins !== need.winner) {
        return NextResponse.json(
          { error: "La cantidad de mapas ganados no coincide con el marcador elegido." },
          { status: 400 }
        );
      }
    }
  }

  const existing = await getResult(matchId);
  const now = new Date().toISOString();
  const result: MatchResult = {
    matchId,
    stage: match.stage,
    playerAId: match.playerAId,
    playerBId: match.playerBId,
    status,
    winnerId,
    score,
    games,
    bansA,
    bansB,
    note: typeof body.note === "string" ? body.note : undefined,
    enteredBy: admin.name,
    enteredAt: existing?.enteredAt ?? now,
    updatedAt: now,
  };

  await saveResult(result);
  return NextResponse.json({ ok: true, result });
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "Falta el partido." }, { status: 400 });
  await deleteResult(matchId);
  return NextResponse.json({ ok: true });
}
