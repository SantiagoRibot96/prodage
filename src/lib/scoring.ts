import { PLAYERS } from "@/lib/data/players";
import type { MatchResult, Prediction, PublicUser, StandingsRow, ProdeRow } from "@/lib/types";

/**
 * Tabla oficial del torneo (fase de grupos), según el Handbook:
 *  - Puntos: ganador 3, perdedor 1 si la serie fue 2-1, perdedor 0 si fue 2-0.
 *  - "No contest" (nadie mostró voluntad de jugar): 0 puntos para ambos, no cuenta
 *    como victoria ni derrota, no suma ni resta mapas.
 *  - Desempate A: menor cantidad de mapas perdidos.
 *  - Desempate B: resultado del enfrentamiento directo.
 *  - Desempate C (serie Bo3 de desempate) queda a criterio manual del admin.
 */
export function computeStandings(results: MatchResult[]): StandingsRow[] {
  const groupResults = results.filter((r) => r.stage === "group");

  const rows: Record<string, StandingsRow> = {};
  for (const p of PLAYERS) {
    rows[p.id] = {
      playerId: p.id,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      mapsWon: 0,
      mapsLost: 0,
      rank: 0,
    };
  }

  // head-to-head: playerId -> playerId -> "win" | "loss"
  const h2h: Record<string, Record<string, "win" | "loss">> = {};
  const setH2H = (winner: string, loser: string) => {
    h2h[winner] ??= {};
    h2h[winner][loser] = "win";
    h2h[loser] ??= {};
    h2h[loser][winner] = "loss";
  };

  for (const r of groupResults) {
    const a = rows[r.playerAId];
    const b = rows[r.playerBId];
    if (!a || !b) continue;
    a.played += 1;
    b.played += 1;

    if (r.status === "no_contest" || !r.winnerId) {
      continue;
    }

    const loserId = r.winnerId === r.playerAId ? r.playerBId : r.playerAId;
    const winnerRow = rows[r.winnerId];
    const loserRow = rows[loserId];
    if (!winnerRow || !loserRow) continue;

    winnerRow.won += 1;
    loserRow.lost += 1;
    winnerRow.points += 3;
    loserRow.points += r.score === "2-1" ? 1 : 0;
    setH2H(r.winnerId, loserId);

    if (r.games && r.games.length > 0) {
      for (const g of r.games) {
        const gWinnerRow = rows[g.winnerId];
        const gLoserId = g.winnerId === r.playerAId ? r.playerBId : r.playerAId;
        const gLoserRow = rows[gLoserId];
        if (gWinnerRow) gWinnerRow.mapsWon += 1;
        if (gLoserRow) gLoserRow.mapsLost += 1;
      }
    } else {
      // admin win sin juegos cargados: se infieren los mapas a partir del marcador
      const [w, l] = (r.score ?? "2-0").split("-").map(Number);
      winnerRow.mapsWon += w;
      winnerRow.mapsLost += l;
      loserRow.mapsWon += l;
      loserRow.mapsLost += w;
    }
  }

  const list = Object.values(rows);
  list.sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    if (x.mapsLost !== y.mapsLost) return x.mapsLost - y.mapsLost;
    const direct = h2h[x.playerId]?.[y.playerId];
    if (direct === "win") return -1;
    if (direct === "loss") return 1;
    return x.playerId.localeCompare(y.playerId);
  });
  list.forEach((row, idx) => (row.rank = idx + 1));
  return list;
}

/**
 * Tabla del prode: 1 punto por acertar el ganador de la serie, 3 puntos si
 * además se acierta el marcador exacto (2-0 / 2-1).
 */
export function computeProdeLeaderboard(
  users: PublicUser[],
  predictions: Prediction[],
  results: MatchResult[]
): ProdeRow[] {
  const resultsById = new Map(results.map((r) => [r.matchId, r]));

  const rows: Record<string, ProdeRow> = {};
  for (const u of users) {
    rows[u.id] = {
      userId: u.id,
      playerId: u.playerId,
      displayUsername: u.displayUsername,
      points: 0,
      exactCount: 0,
      winnerOnlyCount: 0,
      missedCount: 0,
      predictedCount: 0,
    };
  }

  for (const p of predictions) {
    const row = rows[p.userId];
    if (!row) continue;
    const result = resultsById.get(p.matchId);
    if (!result || result.status === "no_contest" || !result.winnerId || !result.score) {
      continue;
    }
    row.predictedCount += 1;
    if (p.predictedWinnerId === result.winnerId) {
      if (p.predictedScore === result.score) {
        row.points += 3;
        row.exactCount += 1;
      } else {
        row.points += 1;
        row.winnerOnlyCount += 1;
      }
    } else {
      row.missedCount += 1;
    }
  }

  const list = Object.values(rows);
  list.sort((a, b) => b.points - a.points || b.exactCount - a.exactCount || b.predictedCount - a.predictedCount);
  return list;
}

export function scoreForPrediction(
  prediction: Pick<Prediction, "predictedWinnerId" | "predictedScore">,
  result: Pick<MatchResult, "status" | "winnerId" | "score"> | null
): { points: number; label: "exacto" | "ganador" | "fallado" | "pendiente" } {
  if (!result || result.status === "no_contest" || !result.winnerId || !result.score) {
    return { points: 0, label: "pendiente" };
  }
  if (prediction.predictedWinnerId !== result.winnerId) {
    return { points: 0, label: "fallado" };
  }
  if (prediction.predictedScore === result.score) {
    return { points: 3, label: "exacto" };
  }
  return { points: 1, label: "ganador" };
}
