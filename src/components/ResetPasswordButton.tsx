"use client";

import { useState } from "react";

export default function ResetPasswordButton({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (
      !confirm(
        `¿Blanquear la contraseña de ${username}? Se va a generar una contraseña temporal nueva y la anterior deja de funcionar.`
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    setNewPassword(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo blanquear la contraseña.");
        return;
      }
      setNewPassword(data.newPassword);
    } catch {
      setError("No se pudo blanquear la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        className="btn-secondary !px-3 !py-1 text-xs"
        onClick={onClick}
        disabled={loading}
      >
        {loading ? "..." : "Blanquear contraseña"}
      </button>
      {newPassword && (
        <p className="mt-1 text-xs text-rda-win">
          Nueva contraseña: <strong className="select-all">{newPassword}</strong>
          <br />
          Pasásela a {username} (no se vuelve a mostrar).
        </p>
      )}
      {error && <p className="mt-1 text-xs text-rda-lose">{error}</p>}
    </div>
  );
}
