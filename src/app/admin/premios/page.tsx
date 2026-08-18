import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { AWARD_CATEGORIES } from "@/lib/data/awards";
import { PLAYERS, playerName } from "@/lib/data/players";
import { getState, listVotes } from "@/lib/repo/awards";
import { listUsers } from "@/lib/repo/users";
import AwardAdminControls from "@/components/AwardAdminControls";
import UndoAwardVoteButton from "@/components/UndoAwardVoteButton";

export const dynamic = "force-dynamic";

export default async function AdminAwardsPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return (
      <p className="text-center text-rda-muted">
        <Link href="/login" className="text-rda-gold hover:underline">
          Ingresá
        </Link>{" "}
        con tu cuenta de administrador.
      </p>
    );
  }
  if (!sessionUser.isAdmin) {
    return <p className="text-center text-rda-muted">Tu cuenta no tiene permisos de administrador.</p>;
  }

  const users = await listUsers();
  const userById = new Map(users.map((u) => [u.id, u.displayUsername]));

  const sections = await Promise.all(
    AWARD_CATEGORIES.map(async (cat) => {
      const [state, votes] = await Promise.all([getState(cat.key), listVotes(cat.key)]);
      return { cat, state, votes };
    })
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-rda-teal hover:underline">
          ← Volver al panel
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-rda-gold">Premios de la temporada</h1>
        <p className="text-sm text-rda-muted">
          Encuesta entre amigos (no suma puntos). Cerrá la votación cuando quieras y declará el
          ganador real de cada categoría para revelar cómo votó todo el mundo.
        </p>
      </div>

      {sections.map(({ cat, state, votes }) => (
        <div key={cat.key} className="card mb-6 p-4">
          <h2 className="text-lg font-semibold">{cat.label}</h2>
          <p className="text-sm text-rda-muted">{cat.description}</p>

          <AwardAdminControls
            category={cat.key}
            players={PLAYERS}
            closed={state.closed}
            winnerPlayerId={state.winnerPlayerId}
          />

          <h3 className="mb-2 mt-4 text-xs uppercase tracking-wide text-rda-muted">
            Votos cargados ({votes.length})
          </h3>
          {votes.length === 0 ? (
            <p className="text-sm text-rda-muted">Nadie votó todavía.</p>
          ) : (
            <ul className="divide-y divide-rda-border/50 text-sm">
              {votes.map((v) => (
                <li key={v.userId} className="flex items-center justify-between gap-2 py-2">
                  <span className="font-medium">{userById.get(v.userId) ?? "?"}</span>
                  <span className="text-rda-muted">{playerName(v.playerId)}</span>
                  <UndoAwardVoteButton
                    category={cat.key}
                    userId={v.userId}
                    username={userById.get(v.userId) ?? "?"}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
