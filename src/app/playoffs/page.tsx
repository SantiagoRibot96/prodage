import Link from "next/link";
import { getPlayoffs } from "@/lib/repo/playoffs";
import { getResult } from "@/lib/repo/results";
import { getPrediction } from "@/lib/repo/predictions";
import { isInProgress } from "@/lib/repo/matchState";
import { getSessionUser } from "@/lib/auth";
import { playerName } from "@/lib/data/players";
import MatchCard from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export default async function PlayoffsPage() {
  const playoffs = await getPlayoffs();
  const user = await getSessionUser();

  if (!playoffs) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-rda-gold">Playoffs</h1>
        <p className="text-rda-muted">
          Las llaves se generan automáticamente cuando termina la fase de grupos: Semifinales 1º
          vs 4º y 2º vs 3º, y la Final entre los ganadores (todo al mejor de 3).
        </p>
        <Link href="/standings" className="mt-4 inline-block text-sm text-rda-teal hover:underline">
          Ver tabla de posiciones →
        </Link>
      </div>
    );
  }

  const semis = playoffs.matches.filter((m) => m.stage === "semi");
  const final = playoffs.matches.find((m) => m.stage === "final");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-rda-gold">Playoffs</h1>
      <p className="mb-6 text-sm text-rda-muted">
        Semifinales (1º vs 4º y 2º vs 3º) y Final, todo al mejor de 3.
      </p>

      <h2 className="mb-3 text-lg font-semibold text-rda-text">Semifinales</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {semis.map((m) => (
          <SemiOrFinalCard key={m.id} matchId={m.id} label={m.label} a={m.a} b={m.b} userId={user?.id} />
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-rda-text">Final</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {final && (
          <SemiOrFinalCard matchId={final.id} label={final.label} a={final.a} b={final.b} userId={user?.id} />
        )}
      </div>
    </div>
  );
}

async function SemiOrFinalCard({
  matchId,
  label,
  a,
  b,
  userId,
}: {
  matchId: string;
  label: string;
  a: { playerId: string | null; seed: number | null };
  b: { playerId: string | null; seed: number | null };
  userId?: string;
}) {
  if (!a.playerId || !b.playerId) {
    return (
      <div className="card p-4 text-center">
        <p className="mb-2 text-xs uppercase tracking-wide text-rda-muted">{label}</p>
        <p className="text-rda-muted">
          {a.playerId ? playerName(a.playerId) : a.seed ? `${a.seed}° puesto` : "Ganador semifinal 1"} vs{" "}
          {b.playerId ? playerName(b.playerId) : b.seed ? `${b.seed}° puesto` : "Ganador semifinal 2"}
        </p>
        <p className="mt-2 text-xs text-rda-muted">A definir</p>
      </div>
    );
  }

  const [result, myPrediction, inProgress] = await Promise.all([
    getResult(matchId),
    userId ? getPrediction(matchId, userId) : Promise.resolve(null),
    isInProgress(matchId),
  ]);

  return (
    <MatchCard
      matchId={matchId}
      playerAId={a.playerId}
      playerBId={b.playerId}
      label={label}
      result={result}
      myPrediction={myPrediction}
      canPredict={!!userId}
      inProgress={inProgress}
    />
  );
}
