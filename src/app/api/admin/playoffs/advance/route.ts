import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { computeStandings } from "@/lib/scoring";
import { listResults } from "@/lib/repo/results";
import { ALL_GROUP_MATCHES } from "@/lib/data/schedule";
import { getPlayoffs, savePlayoffs } from "@/lib/repo/playoffs";
import type { PlayoffMatch, PlayoffsState } from "@/lib/types";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const results = await listResults();
  const existing = await getPlayoffs();

  if (!existing) {
    const playedGroupIds = new Set(
      results.filter((r) => r.stage === "group").map((r) => r.matchId)
    );
    const missing = ALL_GROUP_MATCHES.filter((m) => !playedGroupIds.has(m.id));
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Todavía faltan ${missing.length} partido(s) de la fase de grupos para poder generar los playoffs.`,
        },
        { status: 400 }
      );
    }

    const standings = computeStandings(results);
    const top4 = standings.slice(0, 4);
    if (top4.length < 4) {
      return NextResponse.json({ error: "No hay suficientes jugadores." }, { status: 400 });
    }
    const seeds = top4.map((row, idx) => ({ seed: idx + 1, playerId: row.playerId }));

    const matches: PlayoffMatch[] = [
      {
        id: "semi-1",
        stage: "semi",
        label: "Semifinal · 1º vs 4º",
        a: { playerId: seeds[0].playerId, seed: 1 },
        b: { playerId: seeds[3].playerId, seed: 4 },
      },
      {
        id: "semi-2",
        stage: "semi",
        label: "Semifinal · 2º vs 3º",
        a: { playerId: seeds[1].playerId, seed: 2 },
        b: { playerId: seeds[2].playerId, seed: 3 },
      },
      {
        id: "final",
        stage: "final",
        label: "Final",
        a: { playerId: null, seed: null, fromMatchId: "semi-1" },
        b: { playerId: null, seed: null, fromMatchId: "semi-2" },
      },
    ];

    const state: PlayoffsState = { generatedAt: new Date().toISOString(), seeds, matches };
    await savePlayoffs(state);
    return NextResponse.json({ ok: true, state, message: "Semifinales generadas." });
  }

  const finalMatch = existing.matches.find((m) => m.id === "final");
  if (finalMatch && finalMatch.a.playerId && finalMatch.b.playerId) {
    return NextResponse.json({ ok: true, state: existing, message: "Los playoffs ya están completos." });
  }

  const resultById = new Map(results.map((r) => [r.matchId, r]));
  const semi1 = resultById.get("semi-1");
  const semi2 = resultById.get("semi-2");

  if (!semi1?.winnerId || !semi2?.winnerId) {
    return NextResponse.json(
      { error: "Todavía faltan resultados de alguna semifinal." },
      { status: 400 }
    );
  }

  if (finalMatch) {
    finalMatch.a = { playerId: semi1.winnerId, seed: null, fromMatchId: "semi-1" };
    finalMatch.b = { playerId: semi2.winnerId, seed: null, fromMatchId: "semi-2" };
  }

  await savePlayoffs(existing);
  return NextResponse.json({ ok: true, state: existing, message: "Final generada." });
}
