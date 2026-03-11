"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function getUsersList() {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        const data = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            joinedAt: users.joinedAt,
        }).from(users);
        
        return { success: true, data };
    } catch (e: any) {
        console.error("Error fetching users list:", e);
        return { success: false, error: e.message || "Failed to fetch users" };
    }
}

export async function updateUserRole(userId: string, newRole: "user" | "admin" | "superadmin") {
    try {
        const session = await auth();
        if (session?.user?.role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        // Prevent modifying other superadmins unless it's yourself? 
        // Or perhaps just allow it if they are superadmin.
        // For safety, let's at least ensure they can't accidentally demote the defined SUPER_ADMIN_EMAILS.
        
        const [targetUser] = await db.select().from(users).where(eq(users.id, userId));
        if (!targetUser) {
             return { success: false, error: "User not found" };
        }
        
        if (targetUser.email) {
            const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "")
                .split(",")
                .map(email => email.trim().toLowerCase());
                
            if (superAdmins.includes(targetUser.email.toLowerCase()) && newRole !== "superadmin") {
                return { success: false, error: "Cannot demote a system-defined Super Admin" };
            }
        }

        await db.update(users)
            .set({ role: newRole })
            .where(eq(users.id, userId));
            
        return { success: true };
    } catch (e: any) {
        console.error("Error updating user role:", e);
        return { success: false, error: e.message || "Failed to update role" };
    }
}
