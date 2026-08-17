import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { FECHAS, ALL_GROUP_MATCHES } from "@/lib/data/schedule";
import { listResults } from "@/lib/repo/results";
import { getPlayoffs } from "@/lib/repo/playoffs";
import { playerName } from "@/lib/data/players";
import AdvancePlayoffsButton from "@/components/AdvancePlayoffsButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="text-center text-rda-muted">
        <p>
          Ingresá con tu cuenta de administrador.{" "}
          <Link href="/login" className="text-rda-gold hover:underline">
            Ingresar
          </Link>
        </p>
      </div>
    );
  }
  if (!user.isAdmin) {
    return <p className="text-center text-rda-muted">Tu cuenta no tiene permisos de administrador.</p>;
  }

  const [results, playoffs] = await Promise.all([listResults(), getPlayoffs()]);
  const resultsByMatch = new Map(results.map((r) => [r.matchId, r]));

  const totalGroup = ALL_GROUP_MATCHES.length;
  const playedGroup = ALL_GROUP_MATCHES.filter((m) => resultsByMatch.has(m.id)).length;
  const groupComplete = playedGroup === totalGroup;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-rda-gold">Panel de administración</h1>
      <p className="mb-6 text-sm text-rda-muted">Cargá resultados y gestioná los playoffs.</p>

      <div className="card mb-8 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Playoffs</h2>
          <span className="text-sm text-rda-muted">
            Fase de grupos: {playedGroup}/{totalGroup} jugados
          </span>
        </div>

        {!playoffs && (
          <>
            <p className="mb-3 text-sm text-rda-muted">
              {groupComplete
                ? "La fase de grupos está completa: ya podés generar las semifinales."
                : "Faltan resultados de la fase de grupos para poder generar los playoffs."}
            </p>
            <AdvancePlayoffsButton label="Generar semifinales" />
          </>
        )}

        {playoffs && (
          <div className="space-y-3">
            {playoffs.matches.map((m) => {
              const result = resultsByMatch.get(m.id);
              const ready = !!m.a.playerId && !!m.b.playerId;
              return (
                <div key={m.id} className="flex items-center justify-between border-b border-rda-border/50 pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-rda-muted">
                      {ready
                        ? `${playerName(m.a.playerId)} vs ${playerName(m.b.playerId)}`
                        : "A definir"}
                    </p>
                  </div>
                  {ready ? (
                    <Link href={`/admin/matches/${m.id}`} className="text-sm text-rda-teal hover:underline">
                      {result ? "Editar resultado" : "Cargar resultado"}
                    </Link>
                  ) : (
                    <span className="text-xs text-rda-muted">Pendiente</span>
                  )}
                </div>
              );
            })}
            <AdvancePlayoffsButton label="Actualizar final con ganadores de semis" />
          </div>
        )}
      </div>

      <h2 className="mb-3 text-lg font-semibold">Fase de grupos</h2>
      <div className="space-y-6">
        {FECHAS.map((f) => (
          <div key={f.number}>
            <p className="mb-2 text-sm font-semibold text-rda-muted">
              Fecha {f.number} · {f.label}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {f.matches.map((m) => {
                const result = resultsByMatch.get(m.id);
                return (
                  <Link
                    key={m.id}
                    href={`/admin/matches/${m.id}`}
                    className="card flex items-center justify-between p-3 text-sm hover:border-rda-gold"
                  >
                    <span>
                      {playerName(m.playerAId)} <span className="text-rda-muted">vs</span>{" "}
                      {playerName(m.playerBId)}
                    </span>
                    <span className={result ? "text-rda-win" : "text-rda-muted"}>
                      {result ? "✓ Cargado" : "Pendiente"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
