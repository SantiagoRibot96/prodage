import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { getUserByUsername, verifyPassword } from "@/lib/repo/users";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const user = await getUserByUsername(credentials.username);
        if (!user) return null;
        const valid = await verifyPassword(user, credentials.password);
        if (!valid) return null;
        return {
          id: user.id,
          name: user.displayUsername,
          playerId: user.playerId,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.playerId = user.playerId;
        token.isAdmin = user.isAdmin;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.playerId = token.playerId;
      session.user.isAdmin = token.isAdmin;
      session.user.name = token.name;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) throw new Error("FORBIDDEN");
  return user;
}
