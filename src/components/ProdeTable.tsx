import { playerName } from "@/lib/data/players";
import type { ProdeRow } from "@/lib/types";

export default function ProdeTable({ rows }: { rows: ProdeRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-rda">
        <thead>
          <tr>
            <th>#</th>
            <th>Usuario</th>
            <th>Jugador</th>
            <th className="text-center">PTS</th>
            <th className="text-center">Exactos</th>
            <th className="text-center">Ganador</th>
            <th className="text-center">Fallados</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.userId}>
              <td>{idx + 1}</td>
              <td className="font-medium">{r.displayUsername}</td>
              <td className="text-rda-muted">{playerName(r.playerId)}</td>
              <td className="text-center font-semibold text-rda-gold">{r.points}</td>
              <td className="text-center">{r.exactCount}</td>
              <td className="text-center">{r.winnerOnlyCount}</td>
              <td className="text-center">{r.missedCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-rda-muted">
        1 punto por acertar el ganador de la serie, 3 puntos si además acertás el marcador exacto
        (2-0 / 2-1).
      </p>
    </div>
  );
}
