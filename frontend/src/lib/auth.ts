import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

const AUTH_FAILS = new Map<string, { count: number; resetAt: number }>();
const AUTH_FAIL_WINDOW_MS = 15 * 60 * 1000;
const AUTH_FAIL_MAX = 8;

function authKey(provider: string, id: string): string {
  return `${provider}:${id.trim().toLowerCase() || "empty"}`;
}

async function applyAuthBackoff(key: string): Promise<boolean> {
  const now = Date.now();
  const entry = AUTH_FAILS.get(key);
  if (!entry || now > entry.resetAt) return true;
  if (entry.count >= AUTH_FAIL_MAX) return false;
  const delayMs = Math.min(entry.count * 250, 2_000);
  if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
  return true;
}

function recordAuthResult(key: string, ok: boolean): void {
  if (ok) {
    AUTH_FAILS.delete(key);
    return;
  }
  const now = Date.now();
  const entry = AUTH_FAILS.get(key);
  if (!entry || now > entry.resetAt) {
    AUTH_FAILS.set(key, { count: 1, resetAt: now + AUTH_FAIL_WINDOW_MS });
    return;
  }
  entry.count++;
}

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
        const key = authKey("admin", inputEmail);
        if (!(await applyAuthBackoff(key))) return null;

        if (
          inputEmail.toLowerCase() === adminEmail.toLowerCase() &&
          inputPassword === adminSecret
        ) {
          recordAuthResult(key, true);
          return {
            id: "admin",
            email: adminEmail,
            name: "Администратор",
            role: "admin" as const,
          };
        }

        recordAuthResult(key, false);
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
        const key = authKey("client", contractNumber);
        if (!(await applyAuthBackoff(key))) return null;

        const project = await prisma.clientConstructionProject.findUnique({
          where: { contractNumber },
        });
        if (!project?.passwordHash) {
          recordAuthResult(key, false);
          return null;
        }

        const ok = await verifyPassword(password, project.passwordHash);
        if (!ok) {
          recordAuthResult(key, false);
          return null;
        }

        recordAuthResult(key, true);
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
  /**
   * Иначе при `NEXTAUTH_URL=http://…` NextAuth по запросу HTTPS всё равно мог ставить
   * `__Secure-next-auth.session-token`, а middleware ожидал другое имя — после «Войти» редирект обратно на логин.
   */
  useSecureCookies: (process.env.NEXTAUTH_URL ?? "").trim().startsWith("https://"),
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
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
};
