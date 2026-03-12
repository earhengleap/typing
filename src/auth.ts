import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import authConfig from "./auth.config";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    events: {
        async createUser({ user }) {
            try {
                const { cookies } = await import("next/headers");
                const cookieStore = await cookies();
                const referrerId = cookieStore.get("typeflow_ref")?.value;
                
                if (referrerId && user.id) {
                    const { processReferral } = await import("@/app/actions/referrals");
                    await processReferral(user.id, referrerId);
                }
            } catch (error) {
                console.error("[AUTH] Error in createUser event:", error);
            }
        },
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.level = user.level as number;
                
                // Automatically assign 'superadmin' role based on SUPER_ADMIN_EMAILS
                let currentRole = user.role as string;
                if (user.email) {
                    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
                        .split(",")
                        .map(email => email.trim().toLowerCase());
                    
                    if (superAdmins.includes(user.email.toLowerCase())) {
                        currentRole = "superadmin";
                        // Update the database to reflect this, if it wasn't already updated
                        if (user.role !== "superadmin" && user.id) {
                            try {
                                await db.update(users).set({ role: "superadmin" }).where(eq(users.id, user.id));
                            } catch (e) {
                                console.error("Failed to auto-elevate superadmin in DB:", e);
                            }
                        }
                    }
                }
                
                token.role = currentRole;
            }
            if (trigger === "update" && (session?.level || session?.role)) {
                if (session.level !== undefined) token.level = session.level;
                if (session.role !== undefined) token.role = session.role;
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
