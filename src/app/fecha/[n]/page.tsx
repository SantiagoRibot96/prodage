import { notFound } from "next/navigation";
import Link from "next/link";
import { FECHAS } from "@/lib/data/schedule";
import { listResults } from "@/lib/repo/results";
import { listPredictionsForUser } from "@/lib/repo/predictions";
import { getSessionUser } from "@/lib/auth";
import MatchCard from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export default async function FechaPage({ params }: { params: { n: string } }) {
  const number = Number(params.n);
  const fecha = FECHAS.find((f) => f.number === number);
  if (!fecha) notFound();

  const user = await getSessionUser();
  const results = await listResults();
  const resultsByMatch = new Map(results.map((r) => [r.matchId, r]));
  const myPreds = user ? await listPredictionsForUser(user.id) : [];
  const myPredsByMatch = new Map(myPreds.map((p) => [p.matchId, p]));

  const idx = FECHAS.findIndex((f) => f.number === number);
  const prev = FECHAS[idx - 1];
  const next = FECHAS[idx + 1];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rda-gold">Fecha {fecha.number}</h1>
          <p className="text-sm text-rda-muted">{fecha.label}</p>
        </div>
        <div className="flex gap-2 text-sm">
          {prev && (
            <Link href={`/fecha/${prev.number}`} className="btn-secondary !px-3 !py-1">
              ← Fecha {prev.number}
            </Link>
          )}
          {next && (
            <Link href={`/fecha/${next.number}`} className="btn-secondary !px-3 !py-1">
              Fecha {next.number} →
            </Link>
          )}
        </div>
      </div>

      {!user && (
        <p className="mb-4 text-sm text-rda-muted">
          <Link href="/login" className="text-rda-gold hover:underline">
            Ingresá con tu cuenta
          </Link>{" "}
          para pronosticar estos partidos.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {fecha.matches.map((m) => (
          <MatchCard
            key={m.id}
            matchId={m.id}
            playerAId={m.playerAId}
            playerBId={m.playerBId}
            result={resultsByMatch.get(m.id) ?? null}
            myPrediction={myPredsByMatch.get(m.id) ?? null}
            canPredict={!!user}
          />
        ))}
      </div>
    </div>
  );
}
