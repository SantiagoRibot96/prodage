// Si NEXTAUTH_URL quedó cargada como variable de entorno vacía (por ejemplo,
// se creó en Vercel pero se dejó el valor en blanco), next-auth intenta
// hacer `new URL("")` al inicializarse y tira el build entero abajo con
// "Invalid URL". Mejor borrarla del todo: así next-auth cae solo en su
// propio fallback (VERCEL_URL / localhost) en vez de romper.
if (process.env.NEXTAUTH_URL === "") {
  delete process.env.NEXTAUTH_URL;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
