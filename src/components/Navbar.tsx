"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/fechas", label: "Fechas" },
  { href: "/standings", label: "Tabla" },
  { href: "/prode", label: "Prode" },
  { href: "/playoffs", label: "Playoffs" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-rda-border bg-rda-panel2">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-rda-gold">
          <span className="rounded bg-rda-gold px-1.5 py-0.5 text-xs text-rda-bg">RDA</span>
          <span>Liga Interna de Age</span>
        </Link>

        <button
          className="text-rda-text md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menú"
        >
          ☰
        </button>

        <nav className="hidden items-center gap-4 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm hover:text-rda-gold ${
                pathname === l.href ? "text-rda-gold" : "text-rda-text"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              className={`text-sm font-semibold hover:text-rda-gold ${
                pathname?.startsWith("/admin") ? "text-rda-gold" : "text-rda-teal"
              }`}
            >
              Admin
            </Link>
          )}
          {session?.user ? (
            <div className="flex items-center gap-3 border-l border-rda-border pl-4">
              <span className="text-sm text-rda-muted">{session.user.name}</span>
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-secondary !py-1 !px-3 text-xs">
                Salir
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary !py-1 !px-3 text-xs">
              Ingresar
            </Link>
          )}
        </nav>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-rda-border px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="py-1 text-sm" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          {session?.user?.isAdmin && (
            <Link href="/admin" className="py-1 text-sm font-semibold text-rda-teal" onClick={() => setOpen(false)}>
              Admin
            </Link>
          )}
          {session?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-2 text-left text-sm text-rda-muted"
            >
              Salir ({session.user.name})
            </button>
          ) : (
            <Link href="/login" className="mt-2 text-sm text-rda-gold" onClick={() => setOpen(false)}>
              Ingresar
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
