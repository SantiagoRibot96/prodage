# Prode · Liga Interna RDA (Age of Empires II DE)

Aplicación muy simple para que un grupo de amigos pronostique los partidos de un
torneo interno 1v1 de Age of Empires II DE (formato liga + playoffs, series al
mejor de 3), y para que el organizador cargue los resultados reales (mapas,
civs usadas, civs baneadas).

## Qué incluye

- **Login por usuario/contraseña** (sin email). Registro abierto con un código
  de invitación compartido: cualquiera puede crear una cuenta, no hace falta
  ser uno de los 12 jugadores del torneo (podés asociarte a un jugador de la
  lista o registrarte como invitado/a que solo pronostica). Un segundo código
  opcional ("código admin") da permisos de organizador a la cuenta que lo use.
  Si alguien se olvida la contraseña, el admin se la puede blanquear desde
  `/admin/users` (genera una temporal y se la pasás vos).
- **Pronósticos**: por cada serie Bo3, cada usuario elige ganador + marcador
  exacto (2-0 / 2-1) en dos pasos (elegís y después confirmás). Una vez
  confirmado, el pronóstico es **definitivo**: ni siquiera el propio usuario
  puede cambiarlo (solo el admin puede deshacerlo puntualmente, por si hubo un
  error). Los pronósticos son **privados**: cada uno ve únicamente los
  propios (en `/mis-pronosticos`, agrupados en en curso / abiertos /
  terminados) y el ranking general de puntos — nunca lo que pronosticó otro.
  - Acertar el ganador: **1 punto**.
  - Acertar ganador + marcador exacto: **3 puntos**.
- **Estado "en curso"**: el admin puede marcar un partido como que se está
  jugando ahora mismo, lo que cierra los pronósticos al instante (antes incluso
  de cargar el resultado final).
- **Carga de resultados (admin)**: por cada serie se cargan los mapas jugados
  (el primero siempre Arabia, el resto del pool que perdedor elige), quién
  ganó cada mapa, qué civilización usó cada jugador en cada mapa, y las 2 civs
  que baneó cada jugador antes de la serie. También soporta "Admin Win" (un
  jugador no se presentó) y "Sin contienda" (0 puntos para ambos), según las
  reglas del handbook.
- **Tabla oficial del torneo** (fase de grupos): PTS / J / G / P / Mapas
  perdidos, con los criterios de desempate del handbook (menos mapas
  perdidos, luego enfrentamiento directo).
- **Tabla del prode**: ranking de amigos por puntos de pronósticos (visible
  para todos; los pronósticos individuales no).
- **Playoffs**: al completarse la fase de grupos, el admin genera las
  semifinales (1º vs 4º, 2º vs 3º) con un botón; al cargar los resultados de
  ambas semis, otro botón arma la Final. Los playoffs también se pronostican.

## Stack técnico

- **Next.js 14 (App Router) + TypeScript**, pensado para deployar en Vercel.
- **Postgres (Neon)** como base de datos — tiene plan gratis. En vez de armar
  un esquema relacional grande, se usan dos tablas chiquitas (`kv_store` /
  `kv_set_members`, ver [src/lib/kv.ts](src/lib/kv.ts)) que emulan un
  almacenamiento clave→JSON: es la opción más parecida a "guardar todo en
  archivos JSON" que además persiste correctamente en Vercel (el filesystem
  de las funciones serverless es de solo lectura, por eso no se puede
  escribir en un `.json` del repo en producción). Las tablas se crean solas
  la primera vez que la app necesita usarlas (`CREATE TABLE IF NOT EXISTS`),
  no hace falta correr ninguna migración a mano.
- **NextAuth** (Credentials) para el login, con contraseñas hasheadas
  (bcrypt).

Los datos fijos del torneo (los 12 jugadores, las 11 fechas ya sorteadas, las
~54 civs habilitadas y el pool de mapas) están hardcodeados en
`src/lib/data/` — no hace falta cargarlos a mano. Lo único que vive en la base
son las cuentas, los pronósticos y los resultados que se van cargando.

## Correr en local

Requisitos: Node.js 18+.

```bash
npm install
cp .env.example .env.local
```

Completá `.env.local`:

- `DATABASE_URL`: creá una base gratis en [neon.tech](https://neon.tech) (o
  conectá la integración de Vercel y copiá el valor que te muestra en
  Storage → tu base → `.env.local`). Es del estilo
  `postgresql://usuario:contraseña@ep-algo.neon.tech/neondb?sslmode=require`.
  **Es opcional en local**: si la dejás vacía, `npm run dev` usa
  automáticamente un almacenamiento en memoria (los datos se pierden al
  reiniciar el servidor) para que puedas probar todo el flujo sin depender de
  ningún servicio externo. En producción sí es obligatoria.
- `NEXTAUTH_SECRET`: generá uno con `openssl rand -base64 32`.
- `INVITE_CODE`: el código que le vas a pasar a tus amigos para registrarse.
- `ADMIN_INVITE_CODE`: un código aparte, solo para vos, que además de crear tu
  cuenta le da permisos de administrador.

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Deploy en Vercel

1. Subí este proyecto a un repo de GitHub (o GitLab/Bitbucket).
2. En [vercel.com](https://vercel.com), **Add New → Project** e importá el
   repo.
3. Antes o después del primer deploy, andá a **Storage → Marketplace Database
   Providers → Neon** y conectala al proyecto. Vercel inyecta sola la
   variable `DATABASE_URL` (y alguna otra equivalente tipo `POSTGRES_URL`,
   que la app también reconoce por las dudas).
4. En **Settings → Environment Variables** del proyecto, agregá:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → la URL pública del deploy, ej.
     `https://tu-proyecto.vercel.app`
   - `INVITE_CODE`
   - `ADMIN_INVITE_CODE`
5. Redeployá (o hacé el primer deploy si todavía no lo hiciste).
6. Entrá a `/register`, registrate con tu código admin (vos también sos
   jugador del torneo) y pasale el `INVITE_CODE` a tus amigos para que se
   registren ellos.

No hace falta ningún script de "seed": los 12 jugadores, el fixture de las 11
fechas, las civs y los mapas ya están en el código.

## Estructura del proyecto

```
src/
  app/                    páginas (App Router) y rutas de API
  components/             componentes de UI (formularios, tablas, navbar)
  lib/
    data/                 datos fijos del torneo (jugadores, civs, mapas, fixture)
    repo/                 acceso a la base (usuarios, resultados, predicciones, playoffs)
    kv.ts                  capa clave→JSON sobre Postgres (Neon), con fallback en memoria en dev
    auth.ts               configuración de NextAuth
    scoring.ts             cálculo de la tabla oficial y de la tabla del prode
    matches.ts             resuelve un matchId (de grupos o de playoffs) a sus 2 jugadores
```

## Notas

- Si `NEXTAUTH_URL` queda creada en Vercel pero con el valor en blanco,
  `next-auth` rompe el build entero al inicializarse (`Invalid URL`). Hay una
  guarda en [next.config.mjs](next.config.mjs) que la ignora si llega vacía,
  pero de todas formas conviene completarla bien con la URL pública real del
  deploy (ver sección de deploy).
- `npm audit` va a marcar un par de advisories de Next.js que solo están
  totalmente resueltos en Next 16 (un salto de versión mayor, con cambios
  grandes de API). Se usa acá la última versión parcheada de la rama 14.x
  (`14.2.35`) a propósito, para no arriesgar romper `next-auth` v4 en una app
  chica de uso interno entre amigos. Si en algún momento querés migrar a Next
  15/16 + Auth.js v5, es una tarea aparte.
- El criterio de desempate C del handbook (serie Bo3 extra si sigue habiendo
  empate) no se puede automatizar del todo: si llega a pasar, jugá esa serie
  y cargá manualmente el resultado antes de generar los playoffs (el admin
  puede ver la tabla completa en `/standings` para decidir el top 4).
