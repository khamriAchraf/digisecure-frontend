import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    access_token?: string;
    refresh_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user?: {
      id: string;
      email: string;
    };
  }
}

interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
  [key: string]: any;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const body = new URLSearchParams({
          username: creds?.email ?? "",
          password: creds?.password ?? "",
        });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }
        );
        if (!res.ok) return null;
        return await res.json();
      },
    }),
  ],

  // Keep the encrypted session cookie (which stores the JWT) for 7 days.
  // This doesn’t affect the short-lived backend access token – that is still
  // rotated in the `jwt` callback every few minutes. A longer cookie lifetime
  // simply prevents the browser from losing its login state before refresh
  // can happen.
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7, updateAge: 60 * 5 },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, trigger }) {
      // 1. FIRST RUN (after credentials login)
      if (user && (user as any).access_token) {
        const decoded = jwtDecode<JwtPayload>((user as any).access_token);

        token.accessToken = (user as any).access_token;
        token.refreshToken = (user as any).refresh_token;
        token.accessTokenExpires = decoded.exp * 1000; // epoch ms
        token.user = { id: decoded.sub, email: decoded.email };

        return token;
      }

      // 2. SHOULD WE TRY TO REFRESH?
      //    • Access token close to expiry (<30 s)
      //    • OR explicit getSession() request from client (trigger === 'getSession')
      const needsRefresh =
        (trigger as string) === 'getSession' ||
        Date.now() >= (token.accessTokenExpires as number) - 30_000;

      if (!needsRefresh) {
        return token; // still valid, no refresh needed
      }

      // 3. ATTEMPT ROTATION VIA BACKEND /auth/refresh
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: token.refreshToken }),
        });

        if (!res.ok) throw new Error('Refresh failed');

        const data = await res.json();
        const decoded = jwtDecode<JwtPayload>(data.access_token);

        token.accessToken = data.access_token;
        token.refreshToken = data.refresh_token;
        token.accessTokenExpires = decoded.exp * 1000;
        token.error = undefined;

        return token;
      } catch {
        // Refresh failed – mark for front-end sign-out
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },

    async session({ session, token }) {
      session.user = token.user as { id: string; email: string };
      // expose only short-lived access token to the browser
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      
      console.log("🔍 Session callback - decrypted token:", session.accessToken);
      return session;
    },
  },

  // Revoke token on signOut
  events: {
    async signOut({ token }) {
      if (!token?.refreshToken) return;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: token.refreshToken }),
      }).catch(() => { });
    },
  },
};
export default NextAuth(authOptions); 