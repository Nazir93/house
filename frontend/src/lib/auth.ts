import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
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
          return { id: "1", email: adminEmail, name: "Администратор" };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
