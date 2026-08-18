import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { FECHAS } from "@/lib/data/schedule";
import { listResults } from "@/lib/repo/results";
import { listPredictionsForUser } from "@/lib/repo/predictions";
import { listInProgressIds } from "@/lib/repo/matchState";
import { computeProdeLeaderboard } from "@/lib/scoring";
import { listUsers, toPublicUser } from "@/lib/repo/users";
import MatchCard from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <h1 className="mb-2 text-3xl font-bold text-rda-gold">Prode · Liga Interna RDA</h1>
        <p className="mb-6 text-rda-muted">
          Pronosticá los partidos de la liga de Age of Empires II DE entre amigos: ganador y
          marcador exacto de cada serie al mejor de 3.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/login" className="btn-primary">
            Ingresar
          </Link>
          <Link href="/register" className="btn-secondary">
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  const [results, myPreds, users, inProgressIds] = await Promise.all([
    listResults(),
    listPredictionsForUser(user.id),
    listUsers(),
    listInProgressIds(),
  ]);
  const resultsByMatch = new Map(results.map((r) => [r.matchId, r]));
  const myPredsByMatch = new Map(myPreds.map((p) => [p.matchId, p]));

  const nextFecha =
    FECHAS.find((f) => f.matches.some((m) => !resultsByMatch.has(m.id))) ??
    FECHAS[FECHAS.length - 1];

  const allPreds = await Promise.all(users.map((u) => listPredictionsForUser(u.id)));
  const leaderboard = computeProdeLeaderboard(users.map(toPublicUser), allPreds.flat(), results);
  const myRank = leaderboard.findIndex((r) => r.userId === user.id) + 1;
  const myRow = leaderboard.find((r) => r.userId === user.id);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-rda-gold">Hola, {user.name} 👋</h1>
      <p className="mb-6 text-rda-muted">Pronosticá los partidos pendientes de la fecha.</p>

      {myRow && (
        <div className="card mb-6 flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-rda-muted">Tu posición en el prode</p>
            <p className="text-xl font-bold text-rda-gold">
              #{myRank || "-"} <span className="text-sm font-normal text-rda-text">· {myRow.points} pts</span>
            </p>
          </div>
          <Link href="/prode" className="text-sm text-rda-teal hover:underline">
            Ver tabla completa →
          </Link>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Fecha {nextFecha.number}</h2>
          <p className="text-xs text-rda-muted">{nextFecha.label}</p>
        </div>
        <Link href="/fechas" className="text-sm text-rda-teal hover:underline">
          Ver todas las fechas →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {nextFecha.matches.map((m) => (
          <MatchCard
            key={m.id}
            matchId={m.id}
            playerAId={m.playerAId}
            playerBId={m.playerBId}
            result={resultsByMatch.get(m.id) ?? null}
            myPrediction={myPredsByMatch.get(m.id) ?? null}
            inProgress={inProgressIds.has(m.id)}
          />
        ))}
      </div>
    </div>
  );
}
