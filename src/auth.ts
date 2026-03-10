import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import authConfig from "./auth.config";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    session: {
        strategy: "jwt", // Using JWT allows both Credentials and OAuth to work seamlessly
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.level = user.level as number;
                // @ts-ignore
                token.role = user.role as string;
            }
            if (trigger === "update" && (session?.level || session?.role)) {
                if (session.level) token.level = session.level;
                if (session.role) token.role = session.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.level = token.level as number;
                // @ts-ignore
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    ...authConfig,
});
