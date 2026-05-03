import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin",
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = (process.env.ADMIN_EMAIL || "admin@dom.ru").trim();
        const adminSecret = process.env.ADMIN_SECRET?.trim();

        if (!adminSecret) {
          console.error("[AUTH] ADMIN_SECRET is not set");
          return null;
        }

        const inputEmail = credentials?.email?.trim() ?? "";
        const inputPassword = credentials?.password ?? "";

        if (inputEmail === adminEmail && inputPassword === adminSecret) {
          return {
            id: "admin",
            email: adminEmail,
            name: "Администратор",
            role: "admin" as const,
          };
        }

        return null;
      },
    }),
    CredentialsProvider({
      id: "client-contract",
      name: "Client contract",
      credentials: {
        contractNumber: { label: "Номер договора", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const contractNumber = credentials?.contractNumber?.trim() ?? "";
        const password = credentials?.password ?? "";
        if (!contractNumber || !password) return null;

        const project = await prisma.clientConstructionProject.findUnique({
          where: { contractNumber },
        });
        if (!project?.passwordHash) return null;

        const ok = await verifyPassword(password, project.passwordHash);
        if (!ok) return null;

        return {
          id: project.id,
          email: project.clientEmail ?? `${project.contractNumber}@client.local`,
          name: project.clientName?.trim() || "Клиент",
          role: "client" as const,
          clientProjectId: project.id,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.clientProjectId = user.clientProjectId;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.clientProjectId = token.clientProjectId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
