import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";

/**
 * Demo deploys keep DEMO_AUTH on (cookie login as Alex/Jordan).
 * This module still has to exist so /api/auth/[...nextauth] compiles.
 * Real magic-link email only fires when RESEND_API_KEY is set.
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
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
