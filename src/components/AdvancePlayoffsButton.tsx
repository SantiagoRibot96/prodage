"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdvancePlayoffsButton({ label }: { label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/playoffs/advance", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo actualizar.");
        return;
      }
      setMsg(data.message ?? "Listo.");
      router.refresh();
    } catch {
      setError("No se pudo actualizar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="btn-primary" onClick={onClick} disabled={loading}>
        {loading ? "Actualizando..." : label}
      </button>
      {msg && <p className="mt-2 text-sm text-rda-win">{msg}</p>}
      {error && <p className="mt-2 text-sm text-rda-lose">{error}</p>}
    </div>
  );
}
