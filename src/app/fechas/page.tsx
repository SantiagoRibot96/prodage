import Link from "next/link";
import { FECHAS } from "@/lib/data/schedule";
import { listResults } from "@/lib/repo/results";

export const dynamic = "force-dynamic";

export default async function FechasPage() {
  const results = await listResults();
  const playedIds = new Set(results.map((r) => r.matchId));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-rda-gold">Fechas · Fase de grupos</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {FECHAS.map((f) => {
          const played = f.matches.filter((m) => playedIds.has(m.id)).length;
          const done = played === f.matches.length;
          return (
            <Link
              key={f.number}
              href={`/fecha/${f.number}`}
              className="card flex items-center justify-between p-4 transition-colors hover:border-rda-gold"
            >
              <div>
                <p className="font-semibold">Fecha {f.number}</p>
                <p className="text-xs text-rda-muted">{f.label}</p>
              </div>
              <span className={`text-sm ${done ? "text-rda-win" : "text-rda-muted"}`}>
                {played}/{f.matches.length} jugados
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
