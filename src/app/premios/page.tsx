import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { AWARD_CATEGORIES } from "@/lib/data/awards";
import { PLAYERS, playerName } from "@/lib/data/players";
import { getState, getVote, listVotes } from "@/lib/repo/awards";
import { listUsers } from "@/lib/repo/users";
import AwardVoteForm from "@/components/AwardVoteForm";

export const dynamic = "force-dynamic";

export default async function AwardsPage() {
  const user = await getSessionUser();

  const sections = await Promise.all(
    AWARD_CATEGORIES.map(async (cat) => {
      const [state, myVote] = await Promise.all([
        getState(cat.key),
        user ? getVote(cat.key, user.id) : Promise.resolve(null),
      ]);

      const revealed = state.closed || !!state.winnerPlayerId;
      let tally: { playerId: string; count: number; voters: string[] }[] = [];

      if (revealed) {
        const [votes, users] = await Promise.all([listVotes(cat.key), listUsers()]);
        const userById = new Map(users.map((u) => [u.id, u.displayUsername]));
        const map = new Map<string, string[]>();
        for (const v of votes) {
          const arr = map.get(v.playerId) ?? [];
          arr.push(userById.get(v.userId) ?? "?");
          map.set(v.playerId, arr);
        }
        tally = Array.from(map.entries())
          .map(([playerId, voters]) => ({ playerId, count: voters.length, voters }))
          .sort((a, b) => b.count - a.count);
      }

      return { cat, state, myVote, revealed, tally };
    })
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-rda-gold">Premios de la temporada</h1>
      <p className="mb-6 text-sm text-rda-muted">
        Votá quién creés que se lleva cada premio. Es solo para divertirnos entre amigos: no suma
        puntos al prode. Una vez que votás, queda confirmado.
      </p>

      {!user && (
        <p className="mb-4 text-sm text-rda-muted">
          <Link href="/login" className="text-rda-gold hover:underline">
            Ingresá con tu cuenta
          </Link>{" "}
          para votar.
        </p>
      )}

      <div className="space-y-6">
        {sections.map(({ cat, state, myVote, revealed, tally }) => (
          <div key={cat.key} className="card p-4">
            <h2 className="text-lg font-semibold">{cat.label}</h2>
            <p className="text-sm text-rda-muted">{cat.description}</p>

            {state.winnerPlayerId && (
              <p className="mt-2 text-sm">
                Ganador real: <span className="font-semibold text-rda-gold">{playerName(state.winnerPlayerId)}</span>
              </p>
            )}
            {!state.winnerPlayerId && state.closed && (
              <p className="mt-2 text-xs text-rda-muted">Votación cerrada, todavía sin ganador declarado.</p>
            )}

            {user && (
              <AwardVoteForm
                category={cat.key}
                players={PLAYERS}
                myVotePlayerId={myVote?.playerId ?? null}
                closed={state.closed}
              />
            )}

            {revealed && (
              <div className="mt-4 border-t border-rda-border/50 pt-3">
                <h3 className="mb-2 text-xs uppercase tracking-wide text-rda-muted">Cómo votó el grupo</h3>
                {tally.length === 0 && <p className="text-sm text-rda-muted">Nadie votó todavía.</p>}
                <ul className="space-y-1 text-sm">
                  {tally.map((t) => (
                    <li key={t.playerId} className="flex flex-wrap items-baseline gap-x-2">
                      <span
                        className={
                          t.playerId === state.winnerPlayerId
                            ? "font-semibold text-rda-gold"
                            : "font-medium"
                        }
                      >
                        {playerName(t.playerId)}
                      </span>
                      <span className="text-rda-muted">
                        {t.count} voto{t.count === 1 ? "" : "s"} ({t.voters.join(", ")})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
