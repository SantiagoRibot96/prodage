"use client";

import { useState } from "react";
import Link from "next/link";
import type { Player } from "@/lib/data/players";

export default function PlayerSearchList({ players }: { players: Player[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q ? players.filter((p) => p.name.toLowerCase().includes(q)) : players;

  return (
    <div>
      <input
        className="input mb-4 max-w-xs"
        placeholder="Buscar jugador..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/jugadores/${p.id}`}
            className="card p-4 text-center font-medium transition-colors hover:border-rda-gold"
          >
            {p.name}
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-rda-muted">No se encontró ningún jugador.</p>
      )}
    </div>
  );
}
