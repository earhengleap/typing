import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
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
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string
    }
}
