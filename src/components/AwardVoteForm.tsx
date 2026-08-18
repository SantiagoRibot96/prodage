"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Player } from "@/lib/data/players";
import type { AwardCategory } from "@/lib/types";

export default function AwardVoteForm({
  category,
  players,
  myVotePlayerId,
  closed,
}: {
  category: AwardCategory;
  players: Player[];
  myVotePlayerId: string | null;
  closed: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (myVotePlayerId) {
    const name = players.find((p) => p.id === myVotePlayerId)?.name ?? myVotePlayerId;
    return (
      <div className="mt-3 rounded-md border border-rda-gold/40 bg-rda-gold/10 p-3 text-center">
        <p className="text-sm text-rda-gold">
          Ya votaste: <span className="font-semibold">{name}</span>
        </p>
        <p className="mt-1 text-xs text-rda-muted">Tu voto no se puede cambiar.</p>
      </div>
    );
  }

  if (closed) {
    return (
      <div className="mt-3 rounded-md border border-rda-border bg-rda-panel2 p-3 text-center text-sm text-rda-muted">
        La votación de esta categoría está cerrada.
      </div>
    );
  }

  async function confirm() {
    if (!pending) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/awards/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, playerId: pending }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo votar.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo votar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <select
          className="input"
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          disabled={saving}
        >
          <option value="">Elegí un jugador</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button className="btn-primary shrink-0" disabled={!pending || saving} onClick={confirm}>
          {saving ? "..." : "Confirmar"}
        </button>
      </div>
      {pending && !saving && (
        <p className="mt-1 text-xs text-rda-muted">Una vez confirmado no se puede cambiar.</p>
      )}
      {error && <p className="mt-1 text-xs text-rda-lose">{error}</p>}
    </div>
  );
}
