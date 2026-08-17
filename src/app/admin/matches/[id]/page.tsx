import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getMatchRef } from "@/lib/matches";
import { getResult } from "@/lib/repo/results";
import { playerName } from "@/lib/data/players";
import ResultForm from "@/components/ResultForm";

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

  const result = await getResult(match.id);
  const nameA = playerName(match.playerAId);
  const nameB = playerName(match.playerBId);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-1 text-xs uppercase tracking-wide text-rda-muted">{match.label}</p>
      <h1 className="mb-6 text-2xl font-bold text-rda-gold">
        {nameA} <span className="text-rda-muted">vs</span> {nameB}
      </h1>
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
