import { PLAYERS } from "@/lib/data/players";
import PlayerSearchList from "@/components/PlayerSearchList";

export default function PlayersIndexPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-rda-gold">Jugadores</h1>
      <p className="mb-6 text-sm text-rda-muted">
        Buscá o clickeá un jugador para ver sus estadísticas del torneo.
      </p>
      <PlayerSearchList players={PLAYERS} />
    </div>
  );
}
