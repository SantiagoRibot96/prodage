import { playerName } from "@/lib/data/players";
import type { StandingsRow } from "@/lib/types";

export default function StandingsTable({ rows }: { rows: StandingsRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-rda">
        <thead>
          <tr>
            <th>#</th>
            <th>Jugador</th>
            <th className="text-center">PTS</th>
            <th className="text-center">J</th>
            <th className="text-center">G</th>
            <th className="text-center">P</th>
            <th className="text-center">Mapas P</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.playerId}>
              <td>{r.rank <= 4 ? <span className="font-semibold text-rda-gold">{r.rank}</span> : r.rank}</td>
              <td className="font-medium">{playerName(r.playerId)}</td>
              <td className="text-center font-semibold">{r.points}</td>
              <td className="text-center">{r.played}</td>
              <td className="text-center">{r.won}</td>
              <td className="text-center">{r.lost}</td>
              <td className="text-center">{r.mapsLost}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-rda-muted">
        Los primeros 4 (dorado) clasifican a playoffs. Desempates: 1) menos mapas perdidos, 2)
        enfrentamiento directo, 3) serie Bo3 de desempate (a criterio del organizador).
      </p>
    </div>
  );
}
