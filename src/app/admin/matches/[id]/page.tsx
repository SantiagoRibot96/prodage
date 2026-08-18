import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getMatchRef } from "@/lib/matches";
import { getResult } from "@/lib/repo/results";
import { isInProgress } from "@/lib/repo/matchState";
import { listPredictionsForMatch } from "@/lib/repo/predictions";
import { listUsers } from "@/lib/repo/users";
import { playerName } from "@/lib/data/players";
import ResultForm from "@/components/ResultForm";
import MatchStateControls from "@/components/MatchStateControls";
import UndoPredictionButton from "@/components/UndoPredictionButton";

export const dynamic = "force-dynamic";

export default async function AdminMatchPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();

  if (!user) {
    return (
      <p className="text-center text-rda-muted">
        <Link href="/login" className="text-rda-gold hover:underline">
          Ingresá
        </Link>{" "}
        con tu cuenta de administrador.
      </p>
    );
  }
  if (!user.isAdmin) {
    return <p className="text-center text-rda-muted">Tu cuenta no tiene permisos de administrador.</p>;
  }

  const match = await getMatchRef(params.id);
  if (!match) notFound();

  const [result, inProgress, predictions, users] = await Promise.all([
    getResult(match.id),
    isInProgress(match.id),
    listPredictionsForMatch(match.id),
    listUsers(),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));
  const nameA = playerName(match.playerAId);
  const nameB = playerName(match.playerBId);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-1 text-xs uppercase tracking-wide text-rda-muted">{match.label}</p>
      <h1 className="mb-6 text-2xl font-bold text-rda-gold">
        {nameA} <span className="text-rda-muted">vs</span> {nameB}
      </h1>

      {!result && <MatchStateControls matchId={match.id} inProgress={inProgress} />}

      <div className="card mb-6 p-4">
        <h2 className="mb-3 text-sm font-semibold text-rda-muted">
          Pronósticos cargados ({predictions.length})
        </h2>
        {predictions.length === 0 && (
          <p className="text-sm text-rda-muted">Nadie pronosticó este partido todavía.</p>
        )}
        {predictions.length > 0 && (
          <ul className="divide-y divide-rda-border/50 text-sm">
            {predictions.map((p) => {
              const u = userById.get(p.userId);
              const username = u?.displayUsername ?? "?";
              return (
                <li key={p.userId} className="flex items-center justify-between gap-2 py-2">
                  <span className="font-medium">{username}</span>
                  <span className="text-rda-muted">
                    {playerName(p.predictedWinnerId)} {p.predictedScore}
                  </span>
                  <UndoPredictionButton matchId={match.id} userId={p.userId} username={username} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="card p-4">
        <ResultForm
          matchId={match.id}
          playerA={{ id: match.playerAId, name: nameA }}
          playerB={{ id: match.playerBId, name: nameB }}
          existing={result}
        />
      </div>
    </div>
  );
}
