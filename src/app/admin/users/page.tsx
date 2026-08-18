import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { listUsers, toPublicUser } from "@/lib/repo/users";
import { playerName } from "@/lib/data/players";
import ResetPasswordButton from "@/components/ResetPasswordButton";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
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

  const users = (await listUsers()).map(toPublicUser);
  users.sort((a, b) => a.displayUsername.localeCompare(b.displayUsername));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-rda-teal hover:underline">
          ← Volver al panel
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-rda-gold">Usuarios</h1>
        <p className="text-sm text-rda-muted">
          {users.length} cuenta{users.length === 1 ? "" : "s"} registrada{users.length === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="card divide-y divide-rda-border/50">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-3 p-3">
            <div>
              <p className="font-medium">
                {u.displayUsername}{" "}
                {u.isAdmin && (
                  <span className="ml-1 rounded bg-rda-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-rda-gold">
                    ADMIN
                  </span>
                )}
              </p>
              <p className="text-xs text-rda-muted">
                {u.playerId ? playerName(u.playerId) : "Invitado/a (no juega el torneo)"}
              </p>
            </div>
            <ResetPasswordButton userId={u.id} username={u.displayUsername} />
          </div>
        ))}
        {users.length === 0 && (
          <p className="p-3 text-sm text-rda-muted">Todavía no se registró nadie.</p>
        )}
      </div>
    </div>
  );
}
