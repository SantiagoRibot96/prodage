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
  experimental: {
    // Por defecto, Next.js cachea en el navegador (no en el servidor) las
    // páginas dinámicas hasta 30s cuando navegás con <Link>/router.push: si
    // el admin carga un resultado y alguien va a /standings o /prode
    // clickeando un link, puede ver la versión vieja hasta que pase ese
    // rato o refresque a mano. Con esto, cada navegación a una página
    // dinámica (todas las de esta app, salvo /login) siempre trae los
    // datos frescos del servidor.
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
