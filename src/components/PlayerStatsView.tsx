import type { CountRow, PlayerStats, RateRow } from "@/lib/types";

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function CountList({ rows, emptyLabel }: { rows: CountRow[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-rda-muted">{emptyLabel}</p>;
  }
  return (
    <ol className="space-y-1 text-sm">
      {rows.map((r, i) => (
        <li key={r.key} className="flex items-center justify-between">
          <span>
            <span className="mr-2 text-rda-muted">{i + 1}.</span>
            <span className={i === 0 ? "font-semibold text-rda-gold" : "font-medium"}>{r.key}</span>
          </span>
          <span className="text-rda-muted">
            {r.count} vez{r.count === 1 ? "" : "es"}
          </span>
        </li>
      ))}
    </ol>
  );
}

function RateTable({
  rows,
  keyHeader,
  hitsHeader,
  rateHeader,
  emptyLabel,
}: {
  rows: RateRow[];
  keyHeader: string;
  hitsHeader: string;
  rateHeader: string;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-rda-muted">{emptyLabel}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="table-rda">
        <thead>
          <tr>
            <th>{keyHeader}</th>
            <th className="text-center">Jugadas</th>
            <th className="text-center">{hitsHeader}</th>
            <th className="text-center">{rateHeader}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td className="font-medium">{r.key}</td>
              <td className="text-center">{r.played}</td>
              <td className="text-center">{r.hits}</td>
              <td className="text-center font-semibold text-rda-gold">{pct(r.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlayerStatsView({ stats }: { stats: PlayerStats }) {
  if (stats.gamesPlayed === 0) {
    return (
      <p className="text-sm text-rda-muted">
        Todavía no hay partidas con mapas cargados para este jugador.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rda-muted">
            Top 3 civs más usadas
          </h2>
          <CountList rows={stats.topCivsUsed} emptyLabel="Sin datos." />
        </div>
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rda-muted">
            Top 3 mapas más jugados (además de Arabia)
          </h2>
          <CountList rows={stats.topMapsPlayed} emptyLabel="Solo jugó Arabia hasta ahora." />
        </div>
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rda-muted">
            Civs que más banea
          </h2>
          <CountList rows={stats.mostBannedByThem} emptyLabel="No baneó ninguna civ todavía." />
        </div>
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rda-muted">
            Civs que más le banean
          </h2>
          <CountList rows={stats.mostBannedAgainstThem} emptyLabel="Todavía no le banearon ninguna civ." />
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rda-muted">
          Winrate por mapa
        </h2>
        <RateTable
          rows={stats.winrateByMap}
          keyHeader="Mapa"
          hitsHeader="Ganados"
          rateHeader="Winrate"
          emptyLabel="Sin datos."
        />
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rda-muted">
          Winrate por civ propia
        </h2>
        <RateTable
          rows={stats.winrateByCiv}
          keyHeader="Civ"
          hitsHeader="Ganados"
          rateHeader="Winrate"
          emptyLabel="Sin datos."
        />
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rda-muted">
          Lossrate por civ rival
        </h2>
        <p className="mb-2 text-xs text-rda-muted">
          Qué tan seguido pierde cuando el rival juega cada civilización.
        </p>
        <RateTable
          rows={stats.lossrateByEnemyCiv}
          keyHeader="Civ rival"
          hitsHeader="Perdidos"
          rateHeader="Lossrate"
          emptyLabel="Sin datos."
        />
      </div>
    </div>
  );
}
