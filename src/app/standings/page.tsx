import { listResults } from "@/lib/repo/results";
import { computeStandings } from "@/lib/scoring";
import StandingsTable from "@/components/StandingsTable";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const results = await listResults();
  const rows = computeStandings(results);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-rda-gold">Tabla del torneo</h1>
      <p className="mb-4 text-sm text-rda-muted">Fase de grupos · Liga todos contra todos</p>
      <div className="card p-4">
        <StandingsTable rows={rows} />
      </div>
    </div>
  );
}
