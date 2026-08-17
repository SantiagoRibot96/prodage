"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="card p-6">
        <h1 className="mb-1 text-xl font-bold text-rda-gold">Ingresar</h1>
        <p className="mb-4 text-sm text-rda-muted">
          Liga Interna de Age · Prode entre amigos
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Usuario</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-rda-lose">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-rda-muted">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-rda-gold hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
