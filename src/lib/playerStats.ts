import { ADMIN_MAP } from "@/lib/data/maps";
import type { CountRow, MatchResult, PlayerStats, RateRow } from "@/lib/types";

function topN(counts: Map<string, number>, n: number): CountRow[] {
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, n);
}

function toRateRows(played: Map<string, number>, hits: Map<string, number>): RateRow[] {
  return Array.from(played.entries())
    .map(([key, p]) => {
      const h = hits.get(key) ?? 0;
      return { key, played: p, hits: h, rate: p > 0 ? h / p : 0 };
    })
    .sort((a, b) => b.played - a.played || b.rate - a.rate || a.key.localeCompare(b.key));
}

/**
 * Estadísticas de un jugador a partir de todos los MatchResult donde
 * participó (fase de grupos + playoffs). Solo cuenta partidas con mapas
 * cargados: un "Admin Win"/"Sin contienda" sin detalle de juegos no aporta
 * nada acá (sigue contando para la tabla oficial, no para esto).
 */
export function computePlayerStats(playerId: string, results: MatchResult[]): PlayerStats {
  const relevant = results.filter(
    (r) => (r.playerAId === playerId || r.playerBId === playerId) && r.status !== "no_contest"
  );

  const civGames = new Map<string, number>();
  const civWins = new Map<string, number>();

  const mapGames = new Map<string, number>();
  const mapGamesNoArabia = new Map<string, number>();
  const mapWins = new Map<string, number>();

  const enemyCivGames = new Map<string, number>();
  const enemyCivLosses = new Map<string, number>();

  const bansByThem = new Map<string, number>();
  const bansAgainstThem = new Map<string, number>();

  let matchesPlayed = 0;
  let gamesPlayed = 0;
  let gamesWon = 0;

  for (const r of relevant) {
    matchesPlayed += 1;
    const isA = r.playerAId === playerId;
    const myBans = isA ? r.bansA : r.bansB;
    const enemyBans = isA ? r.bansB : r.bansA;

    for (const c of myBans) bansByThem.set(c, (bansByThem.get(c) ?? 0) + 1);
    for (const c of enemyBans) bansAgainstThem.set(c, (bansAgainstThem.get(c) ?? 0) + 1);

    for (const g of r.games) {
      const myCiv = isA ? g.civA : g.civB;
      const enemyCiv = isA ? g.civB : g.civA;
      const won = g.winnerId === playerId;

      gamesPlayed += 1;
      if (won) gamesWon += 1;

      civGames.set(myCiv, (civGames.get(myCiv) ?? 0) + 1);
      if (won) civWins.set(myCiv, (civWins.get(myCiv) ?? 0) + 1);

      mapGames.set(g.map, (mapGames.get(g.map) ?? 0) + 1);
      if (g.map !== ADMIN_MAP) {
        mapGamesNoArabia.set(g.map, (mapGamesNoArabia.get(g.map) ?? 0) + 1);
      }
      if (won) mapWins.set(g.map, (mapWins.get(g.map) ?? 0) + 1);

      enemyCivGames.set(enemyCiv, (enemyCivGames.get(enemyCiv) ?? 0) + 1);
      if (!won) enemyCivLosses.set(enemyCiv, (enemyCivLosses.get(enemyCiv) ?? 0) + 1);
    }
  }

  return {
    playerId,
    matchesPlayed,
    gamesPlayed,
    gamesWon,
    topCivsUsed: topN(civGames, 3),
    topMapsPlayed: topN(mapGamesNoArabia, 3),
    winrateByMap: toRateRows(mapGames, mapWins),
    winrateByCiv: toRateRows(civGames, civWins),
    lossrateByEnemyCiv: toRateRows(enemyCivGames, enemyCivLosses),
    mostBannedByThem: topN(bansByThem, 3),
    mostBannedAgainstThem: topN(bansAgainstThem, 3),
  };
}
