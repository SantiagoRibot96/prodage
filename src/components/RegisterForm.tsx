"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Player } from "@/lib/data/players";

export default function RegisterForm({ availablePlayers }: { availablePlayers: Player[] }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [playerId, setPlayerId] = useState(availablePlayers[0]?.id ?? "");
  const [inviteCode, setInviteCode] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!playerId) {
      setError("No quedan jugadores disponibles para asociar. Hablá con el admin.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, playerId, inviteCode, adminCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la cuenta.");
        setLoading(false);
        return;
      }
      const login = await signIn("credentials", { username, password, redirect: false });
      setLoading(false);
      if (login?.error) {
        setError("Cuenta creada, pero falló el ingreso automático. Probá loguearte.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError("No se pudo crear la cuenta.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">¿Quién sos? (jugador del torneo)</label>
        <select
          className="input"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          required
        >
          {availablePlayers.length === 0 && <option value="">Sin jugadores disponibles</option>}
          {availablePlayers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Usuario</label>
        <input
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          minLength={3}
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
          autoComplete="new-password"
          minLength={4}
          required
        />
      </div>
      <div>
        <label className="label">Código de invitación</label>
        <input
          className="input"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label">Código de administrador (opcional)</label>
        <input
          className="input"
          value={adminCode}
          onChange={(e) => setAdminCode(e.target.value)}
          placeholder="Dejalo vacío si no sos el organizador"
        />
      </div>
      {error && <p className="text-sm text-rda-lose">{error}</p>}
      <button className="btn-primary w-full" disabled={loading || availablePlayers.length === 0}>
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
