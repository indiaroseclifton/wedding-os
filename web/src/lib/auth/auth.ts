import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";

/**
 * Magic-link email via Resend. Demo cookie login stays available
 * until DEMO_AUTH=0. This module must exist so /api/auth compiles.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY || "re_demo_unused",
      from: process.env.EMAIL_FROM || "Wedding OS <onboarding@resend.dev>",
    }),
  ],
  secret: process.env.AUTH_SECRET || "wedding-os-demo-secret-not-for-prod-32",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const email = user.email.toLowerCase();
        token.sub = email;
        token.email = email;
        token.name = user.name || email.split("@")[0];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const email = String(token.email || session.user.email || "").toLowerCase();
        session.user.id = email;
        session.user.email = email;
        session.user.name = (token.name as string) || session.user.name || email.split("@")[0];
      }
      return session;
    },
  },
});
