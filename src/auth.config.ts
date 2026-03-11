import { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default {
    providers: [
        GitHub({
            allowDangerousEmailAccountLinking: true,
        }),
        Google({
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
        Credentials({
            async authorize(credentials) {
                const { email, password } = credentials || {};

                if (!email || !password) return null;

                const [user] = await db.select().from(users).where(eq(users.email, email as string));

                if (!user || !user.password) return null;

                const passwordsMatch = await bcrypt.compare(password as string, user.password);

                if (passwordsMatch) {
                    return {
                        ...user,
                        role: user.role as "user" | "admin" | "superadmin"
                    };
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
} satisfies NextAuthConfig;
