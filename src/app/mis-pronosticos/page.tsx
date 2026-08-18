import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { listPredictionsForUser } from "@/lib/repo/predictions";
import { getResult } from "@/lib/repo/results";
import { listInProgressIds } from "@/lib/repo/matchState";
import { getMatchRef, type MatchRef } from "@/lib/matches";
import { playerName } from "@/lib/data/players";
import { scoreForPrediction } from "@/lib/scoring";
import { OUTCOME_STYLE, OUTCOME_LABEL } from "@/lib/ui";
import type { MatchResult, Prediction } from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = { prediction: Prediction; match: MatchRef; result: MatchResult | null };
type EstadoKey = "cerrada" | "abierta" | "terminada";

const SECTIONS: { key: EstadoKey; title: string; hint: string }[] = [
  { key: "cerrada", title: "En curso", hint: "La partida ya empezó, tu pronóstico quedó cerrado." },
  { key: "abierta", title: "Abiertas", hint: "Todavía no se jugó ni se cargó el resultado." },
  { key: "terminada", title: "Terminadas", hint: "Ya se cargó el resultado." },
];

export default async function MyPredictionsPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <p className="text-center text-rda-muted">
        <Link href="/login" className="text-rda-gold hover:underline">
          Ingresá
        </Link>{" "}
        con tu cuenta para ver tus pronósticos.
      </p>
    );
  }

  const [predictions, inProgressIds] = await Promise.all([
    listPredictionsForUser(user.id),
    listInProgressIds(),
  ]);

  const rows: Row[] = (
    await Promise.all(
      predictions.map(async (prediction) => {
        const [match, result] = await Promise.all([
          getMatchRef(prediction.matchId),
          getResult(prediction.matchId),
        ]);
        if (!match) return null;
        return { prediction, match, result };
      })
    )
  ).filter((r): r is Row => !!r);

  const groups: Record<EstadoKey, Row[]> = { abierta: [], cerrada: [], terminada: [] };
  for (const row of rows) {
    if (row.result) groups.terminada.push(row);
    else if (inProgressIds.has(row.prediction.matchId)) groups.cerrada.push(row);
    else groups.abierta.push(row);
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-rda-gold">Mis pronósticos</h1>
      <p className="mb-6 text-sm text-rda-muted">
        Solo vos ves esta lista: tus pronósticos son privados hasta que vos decidas contarlos.
      </p>

      {rows.length === 0 && (
        <p className="text-sm text-rda-muted">
          Todavía no pronosticaste ningún partido.{" "}
          <Link href="/fechas" className="text-rda-gold hover:underline">
            Ver fechas →
          </Link>
        </p>
      )}

      {SECTIONS.map((section) => {
        const items = groups[section.key];
        if (rows.length === 0) return null;
        return (
          <section key={section.key} className="mb-8">
            <h2 className="text-lg font-semibold text-rda-text">
              {section.title} <span className="text-sm font-normal text-rda-muted">({items.length})</span>
            </h2>
            <p className="mb-3 text-xs text-rda-muted">{section.hint}</p>
            {items.length === 0 ? (
              <p className="text-sm text-rda-muted">Nada por acá.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((row) => {
                  const outcome = row.result ? scoreForPrediction(row.prediction, row.result) : null;
                  return (
                    <Link
                      key={row.match.id}
                      href={`/match/${row.match.id}`}
                      className="card block p-3 transition-colors hover:border-rda-gold"
                    >
                      <p className="text-xs uppercase tracking-wide text-rda-muted">{row.match.label}</p>
                      <p className="text-sm font-medium">
                        {playerName(row.match.playerAId)} <span className="text-rda-muted">vs</span>{" "}
                        {playerName(row.match.playerBId)}
                      </p>
                      <p className="mt-1 text-sm text-rda-gold">
                        {playerName(row.prediction.predictedWinnerId)} {row.prediction.predictedScore}
                      </p>
                      {outcome && (
                        <span
                          className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs ${OUTCOME_STYLE[outcome.label]}`}
                        >
                          {OUTCOME_LABEL[outcome.label]}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
