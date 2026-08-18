import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { resetPassword } from "@/lib/repo/users";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const { user, newPassword } = await resetPassword(params.id);
    return NextResponse.json({ ok: true, username: user.displayUsername, newPassword });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "No se pudo blanquear la contraseña." },
      { status: 400 }
    );
  }
}
