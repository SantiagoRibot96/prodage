import Link from "next/link";
import { playerName } from "@/lib/data/players";
import type { MatchResult, Prediction } from "@/lib/types";
import { scoreForPrediction } from "@/lib/scoring";
import { OUTCOME_STYLE, OUTCOME_LABEL } from "@/lib/ui";
import PredictionForm from "@/components/PredictionForm";

export default function MatchCard({
  matchId,
  playerAId,
  playerBId,
  label,
  result,
  myPrediction,
  linkToDetail = true,
  canPredict = true,
}: {
  matchId: string;
  playerAId: string;
  playerBId: string;
  label?: string;
  result: MatchResult | null;
  myPrediction: Prediction | null;
  linkToDetail?: boolean;
  canPredict?: boolean;
}) {
  const nameA = playerName(playerAId);
  const nameB = playerName(playerBId);

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        {label && <span className="text-xs uppercase tracking-wide text-rda-muted">{label}</span>}
        {linkToDetail && (
          <Link href={`/match/${matchId}`} className="text-xs text-rda-teal hover:underline">
            Ver detalle
          </Link>
        )}
      </div>

      <div className="mb-3 flex items-center justify-center gap-3 text-center">
        <span
          className={`text-base font-semibold ${
            result?.winnerId === playerAId ? "text-rda-gold" : "text-rda-text"
          }`}
        >
          {nameA}
        </span>
        <span className="text-rda-muted">vs</span>
        <span
          className={`text-base font-semibold ${
            result?.winnerId === playerBId ? "text-rda-gold" : "text-rda-text"
          }`}
        >
          {nameB}
        </span>
      </div>

      {result ? (
        <div className="text-center">
          {result.status === "no_contest" ? (
            <p className="text-sm text-rda-muted">Sin contienda (0 pts para ambos)</p>
          ) : (
            <p className="text-sm text-rda-text">
              Ganó <span className="font-semibold text-rda-gold">{playerName(result.winnerId)}</span>{" "}
              <span className="text-rda-muted">({result.score})</span>
              {result.status === "admin_win" && (
                <span className="ml-1 text-xs text-rda-muted">· Admin Win</span>
              )}
            </p>
          )}
          {myPrediction &&
            (() => {
              const outcome = scoreForPrediction(myPrediction, result);
              return (
                <span
                  className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs ${OUTCOME_STYLE[outcome.label]}`}
                >
                  Pronosticaste {playerName(myPrediction.predictedWinnerId)} {myPrediction.predictedScore} ·{" "}
                  {OUTCOME_LABEL[outcome.label]}
                </span>
              );
            })()}
          {!myPrediction && (
            <p className="mt-2 text-xs text-rda-muted">No hiciste un pronóstico para este partido.</p>
          )}
        </div>
      ) : canPredict ? (
        <PredictionForm
          matchId={matchId}
          playerA={{ id: playerAId, name: nameA }}
          playerB={{ id: playerBId, name: nameB }}
          initial={
            myPrediction
              ? {
                  predictedWinnerId: myPrediction.predictedWinnerId,
                  predictedScore: myPrediction.predictedScore,
                }
              : null
          }
        />
      ) : (
        <p className="text-center text-xs text-rda-muted">
          Ingresá con tu cuenta para pronosticar este partido.
        </p>
      )}
    </div>
  );
}
