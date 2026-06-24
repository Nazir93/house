import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authorizeAdminCredentials, authorizeClientCredentials } from "@/lib/auth-credentials";

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
        return authorizeAdminCredentials(credentials?.email, credentials?.password);
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
        return authorizeClientCredentials(credentials?.contractNumber, credentials?.password);
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
