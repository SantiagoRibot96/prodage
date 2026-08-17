import { listResults } from "@/lib/repo/results";
import { listUsers } from "@/lib/repo/users";
import { listPredictionsForUser } from "@/lib/repo/predictions";
import { computeProdeLeaderboard } from "@/lib/scoring";
import { toPublicUser } from "@/lib/repo/users";
import ProdeTable from "@/components/ProdeTable";

export const dynamic = "force-dynamic";

export default async function ProdePage() {
  const [results, users] = await Promise.all([listResults(), listUsers()]);
  const allPreds = await Promise.all(users.map((u) => listPredictionsForUser(u.id)));
  const rows = computeProdeLeaderboard(users.map(toPublicUser), allPreds.flat(), results);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-rda-gold">Tabla del Prode</h1>
      <p className="mb-4 text-sm text-rda-muted">Ranking de pronósticos entre amigos</p>
      <div className="card p-4">
        <ProdeTable rows={rows} />
      </div>
    </div>
  );
}
