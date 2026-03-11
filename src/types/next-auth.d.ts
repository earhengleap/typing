import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role?: "user" | "admin" | "superadmin"
        } & DefaultSession["user"]
    }

    interface User {
        id?: string
        name?: string | null
        email?: string | null
        image?: string | null
        password?: string | null
        level?: number
        xp?: number
        role?: "user" | "admin" | "superadmin"
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        role?: "user" | "admin" | "superadmin"
    }
}
