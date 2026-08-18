import { NextResponse } from "next/server";
import { PLAYERS_BY_ID } from "@/lib/data/players";
import { createUser } from "@/lib/repo/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, playerId, inviteCode, adminCode } = body ?? {};

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "El usuario debe tener al menos 3 caracteres." },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string" || password.length < 4) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 4 caracteres." },
        { status: 400 }
      );
    }
    // playerId es opcional: no hace falta ser uno de los 12 jugadores del
    // torneo para registrarse y pronosticar (amigos que solo miran también
    // pueden crear cuenta).
    let resolvedPlayerId: string | null = null;
    if (playerId) {
      if (!PLAYERS_BY_ID[playerId]) {
        return NextResponse.json({ error: "Jugador inválido." }, { status: 400 });
      }
      resolvedPlayerId = playerId;
    }

    if (!inviteCode || inviteCode !== process.env.INVITE_CODE) {
      return NextResponse.json(
        { error: "Código de invitación incorrecto." },
        { status: 401 }
      );
    }

    const isAdmin = Boolean(
      adminCode &&
        process.env.ADMIN_INVITE_CODE &&
        adminCode === process.env.ADMIN_INVITE_CODE
    );

    const user = await createUser({ username, password, playerId: resolvedPlayerId, isAdmin });

    return NextResponse.json({
      ok: true,
      username: user.displayUsername,
      isAdmin: user.isAdmin,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "No se pudo crear la cuenta." },
      { status: 400 }
    );
  }
}
