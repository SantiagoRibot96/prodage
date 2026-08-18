"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AwardCategory } from "@/lib/types";

export default function UndoAwardVoteButton({
  category,
  userId,
  username,
}: {
  category: AwardCategory;
  userId: string;
  username: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!confirm(`¿Deshacer el voto de ${username} en esta categoría? Va a poder volver a votar.`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/awards/vote?category=${encodeURIComponent(category)}&userId=${encodeURIComponent(userId)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo deshacer.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se pudo deshacer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span>
      <button
        type="button"
        className="text-xs text-rda-lose hover:underline disabled:opacity-50"
        onClick={onClick}
        disabled={loading}
      >
        {loading ? "..." : "Deshacer"}
      </button>
      {error && <span className="ml-2 text-xs text-rda-lose">{error}</span>}
    </span>
  );
}
