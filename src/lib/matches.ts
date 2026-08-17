import { GROUP_MATCHES_BY_ID, fechaOf } from "@/lib/data/schedule";
import { getPlayoffs } from "@/lib/repo/playoffs";
import type { Stage } from "@/lib/types";

export type MatchRef = {
  id: string;
  stage: Stage;
  playerAId: string;
  playerBId: string;
  fecha?: number;
  label: string;
};

export async function getMatchRef(matchId: string): Promise<MatchRef | null> {
  const gm = GROUP_MATCHES_BY_ID[matchId];
  if (gm) {
    const f = fechaOf(matchId);
    return {
      id: gm.id,
      stage: "group",
      playerAId: gm.playerAId,
      playerBId: gm.playerBId,
      fecha: gm.fecha,
      label: f ? `Fecha ${f.number}` : `Fecha ${gm.fecha}`,
    };
  }

  const playoffs = await getPlayoffs();
  const pm = playoffs?.matches.find((m) => m.id === matchId);
  if (pm && pm.a.playerId && pm.b.playerId) {
    return {
      id: pm.id,
      stage: pm.stage,
      playerAId: pm.a.playerId,
      playerBId: pm.b.playerId,
      label: pm.label,
    };
  }

  return null;
}
