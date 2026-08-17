import Link from "next/link";
import { PLAYERS } from "@/lib/data/players";
import { listTakenPlayerIds } from "@/lib/repo/users";
import RegisterForm from "@/components/RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const taken = await listTakenPlayerIds();
  const availablePlayers = PLAYERS.filter((p) => !taken.has(p.id));

  return (
    <div className="mx-auto max-w-sm">
      <div className="card p-6">
        <h1 className="mb-1 text-xl font-bold text-rda-gold">Crear cuenta</h1>
        <p className="mb-4 text-sm text-rda-muted">
          Usá el código que te pasó el organizador del torneo.
        </p>
        <RegisterForm availablePlayers={availablePlayers} />
        <p className="mt-4 text-center text-sm text-rda-muted">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-rda-gold hover:underline">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}
