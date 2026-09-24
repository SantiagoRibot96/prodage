import Link from "next/link";
import { notFound } from "next/navigation";
import { PLAYERS_BY_ID, playerName } from "@/lib/data/players";
import { listResults } from "@/lib/repo/results";
import { computePlayerStats } from "@/lib/playerStats";
import PlayerStatsView from "@/components/PlayerStatsView";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  if (!PLAYERS_BY_ID[params.id]) notFound();

  const results = await listResults();
  const stats = computePlayerStats(params.id, results);

  return (
    <div>
      <Link href="/jugadores" className="text-sm text-rda-teal hover:underline">
        ← Todos los jugadores
      </Link>
      <h1 className="mb-1 mt-1 text-2xl font-bold text-rda-gold">{playerName(params.id)}</h1>
      <p className="mb-6 text-sm text-rda-muted">
        {stats.matchesPlayed} serie{stats.matchesPlayed === 1 ? "" : "s"} con detalle cargado ·{" "}
        {stats.gamesPlayed} mapa{stats.gamesPlayed === 1 ? "" : "s"} ({stats.gamesWon} ganado
        {stats.gamesWon === 1 ? "" : "s"})
      </p>
      <PlayerStatsView stats={stats} />
    </div>
  );
}
