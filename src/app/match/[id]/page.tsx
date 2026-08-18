import { notFound } from "next/navigation";
import { getMatchRef } from "@/lib/matches";
import { getResult } from "@/lib/repo/results";
import { getPrediction } from "@/lib/repo/predictions";
import { isInProgress } from "@/lib/repo/matchState";
import { getSessionUser } from "@/lib/auth";
import { playerName } from "@/lib/data/players";
import { scoreForPrediction } from "@/lib/scoring";
import { OUTCOME_STYLE, OUTCOME_LABEL } from "@/lib/ui";
import PredictionForm from "@/components/PredictionForm";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = await getMatchRef(params.id);
  if (!match) notFound();

  const user = await getSessionUser();
  const [result, inProgress, myPrediction] = await Promise.all([
    getResult(match.id),
    isInProgress(match.id),
    user ? getPrediction(match.id, user.id) : Promise.resolve(null),
  ]);
  const nameA = playerName(match.playerAId);
  const nameB = playerName(match.playerBId);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-1 text-xs uppercase tracking-wide text-rda-muted">{match.label}</p>
      <h1 className="mb-4 text-2xl font-bold text-rda-gold">
        {nameA} <span className="text-rda-muted">vs</span> {nameB}
      </h1>

      <div className="card mb-6 p-4">
        <h2 className="mb-2 text-sm font-semibold text-rda-muted">Tu pronóstico</h2>
        {!user && (
          <p className="text-sm text-rda-muted">Ingresá con tu cuenta para pronosticar este partido.</p>
        )}
        {user && !result && (
          <PredictionForm
            matchId={match.id}
            playerA={{ id: match.playerAId, name: nameA }}
            playerB={{ id: match.playerBId, name: nameB }}
            locked={inProgress}
            initial={
              myPrediction
                ? {
                    predictedWinnerId: myPrediction.predictedWinnerId,
                    predictedScore: myPrediction.predictedScore,
                  }
                : null
            }
          />
        )}
        {user && result && myPrediction && (
          <div>
            <p className="text-sm">
              Pronosticaste{" "}
              <span className="font-semibold text-rda-gold">
                {playerName(myPrediction.predictedWinnerId)} {myPrediction.predictedScore}
              </span>
            </p>
            {(() => {
              const outcome = scoreForPrediction(myPrediction, result);
              return (
                <span
                  className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs ${OUTCOME_STYLE[outcome.label]}`}
                >
                  {OUTCOME_LABEL[outcome.label]}
                </span>
              );
            })()}
          </div>
        )}
        {user && result && !myPrediction && (
          <p className="text-sm text-rda-muted">No pronosticaste este partido.</p>
        )}
        <p className="mt-3 text-xs text-rda-muted">
          Solo vos podés ver tu pronóstico: los de los demás son privados.
        </p>
      </div>

      <div className="card p-4">
        <h2 className="mb-2 text-sm font-semibold text-rda-muted">Resultado</h2>
        {!result && (
          <p className="text-sm text-rda-muted">
            Todavía no se cargó el resultado.
            {inProgress && " La partida está en curso."}
          </p>
        )}
        {result && result.status === "no_contest" && (
          <p>
            Sin contienda — 0 puntos para ambos jugadores.
            {result.note && <span className="text-rda-muted"> · {result.note}</span>}
          </p>
        )}
        {result && result.status !== "no_contest" && (
          <>
            <p className="mb-3 text-lg">
              Ganó <span className="font-semibold text-rda-gold">{playerName(result.winnerId)}</span>{" "}
              <span className="text-rda-muted">({result.score})</span>
              {result.status === "admin_win" && (
                <span className="ml-2 text-xs text-rda-muted">· Admin Win</span>
              )}
            </p>

            {result.games.length > 0 && (
              <div className="mb-3 overflow-x-auto">
                <table className="table-rda">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mapa</th>
                      <th>{nameA}</th>
                      <th>{nameB}</th>
                      <th>Ganador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.games.map((g) => (
                      <tr key={g.gameNumber}>
                        <td>{g.gameNumber}</td>
                        <td>{g.map}</td>
                        <td>{g.civA}</td>
                        <td>{g.civB}</td>
                        <td className="font-medium text-rda-gold">{playerName(g.winnerId)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(result.bansA.length > 0 || result.bansB.length > 0) && (
              <p className="text-sm text-rda-muted">
                Bans: <strong className="text-rda-text">{nameA}</strong> baneó{" "}
                {result.bansA.join(", ") || "—"} · <strong className="text-rda-text">{nameB}</strong> baneó{" "}
                {result.bansB.join(", ") || "—"}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
