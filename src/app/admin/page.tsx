import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { FECHAS, ALL_GROUP_MATCHES } from "@/lib/data/schedule";
import { listResults } from "@/lib/repo/results";
import { getPlayoffs } from "@/lib/repo/playoffs";
import { listInProgressIds } from "@/lib/repo/matchState";
import { countAllPredictions } from "@/lib/repo/predictions";
import { playerName } from "@/lib/data/players";
import AdvancePlayoffsButton from "@/components/AdvancePlayoffsButton";
import ResetPredictionsButton from "@/components/ResetPredictionsButton";

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

  const [results, playoffs, inProgressIds, predictionsCount] = await Promise.all([
    listResults(),
    getPlayoffs(),
    listInProgressIds(),
    countAllPredictions(),
  ]);
  const resultsByMatch = new Map(results.map((r) => [r.matchId, r]));

  const totalGroup = ALL_GROUP_MATCHES.length;
  const playedGroup = ALL_GROUP_MATCHES.filter((m) => resultsByMatch.has(m.id)).length;
  const groupComplete = playedGroup === totalGroup;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rda-gold">Panel de administración</h1>
          <p className="text-sm text-rda-muted">Cargá resultados y gestioná los playoffs.</p>
        </div>
        <div className="flex gap-4 text-sm">
          <Link href="/admin/premios" className="text-rda-teal hover:underline">
            Premios →
          </Link>
          <Link href="/admin/users" className="text-rda-teal hover:underline">
            Gestionar usuarios →
          </Link>
        </div>
      </div>

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
                const live = !result && inProgressIds.has(m.id);
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
                    <span className={result ? "text-rda-win" : live ? "text-rda-lose" : "text-rda-muted"}>
                      {result ? "✓ Cargado" : live ? "🔴 En curso" : "Pendiente"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-10 border-rda-lose/50 p-4">
        <h2 className="mb-1 text-lg font-semibold text-rda-lose">Zona de peligro</h2>
        <p className="mb-3 text-xs text-rda-muted">
          Reinicia la tabla del prode (los pronósticos) para que todos arranquen de cero. Los
          resultados, la tabla oficial y los playoffs no se tocan.
        </p>
        <ResetPredictionsButton currentCount={predictionsCount} />
      </div>
    </div>
  );
}
