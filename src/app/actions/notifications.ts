"use server";

import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, and, or, isNull, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function getNotifications() {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        // Fetch global announcements (userId is null) 
        // AND user-specific notifications (if logged in)
        const whereClause = userId 
            ? or(isNull(notifications.userId), eq(notifications.userId, userId))
            : isNull(notifications.userId);

        const data = await db.select()
            .from(notifications)
            .where(whereClause)
            .orderBy(desc(notifications.createdAt));

        return {
            inbox: data.filter(n => n.type === "inbox"),
            announcements: data.filter(n => n.type === "announcement"),
            notifications: data.filter(n => n.type === "notification")
        };
    } catch (e) {
        console.error("Error fetching notifications:", e);
        return { inbox: [], announcements: [], notifications: [] };
    }
}

export async function markNotificationAsRead(id: string) {
    try {
        await db.update(notifications)
            .set({ read: 1 })
            .where(eq(notifications.id, id));
        return { success: true };
    } catch (e) {
        console.error("Error marking notification as read:", e);
        return { success: false };
    }
}

export async function markAllAsRead(type?: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) return { success: false };

        let whereClause = eq(notifications.userId, userId);
        if (type) {
            whereClause = and(whereClause, eq(notifications.type, type)) as any;
        }

        await db.update(notifications)
            .set({ read: 1 })
            .where(whereClause);
        
        return { success: true };
    } catch (e) {
        console.error("Error marking all as read:", e);
        return { success: false };
    }
}

export async function getUsers() {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.role !== "admin" && session?.user?.role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        const data = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
        }).from(users);
        return data;
    } catch (e) {
        console.error("Error fetching users:", e);
        return [];
    }
}

export async function sendNotification(data: {
    type: string;
    title: string;
    message: string;
    userId?: string | null;
}) {
    try {
        const session = await auth();
        const role = session?.user?.role;
        if (role !== "admin" && role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        await db.insert(notifications).values({
            type: data.type,
            title: data.title,
            message: data.message,
            userId: data.userId || null,
        });
        return { success: true };
    } catch (e) {
        console.error("Error sending notification:", e);
        return { success: false };
    }
}

export async function getSentNotifications() {
    try {
        const session = await auth();
        const role = session?.user?.role;
        if (role !== "admin" && role !== "superadmin") {
            throw new Error("Unauthorized");
        }

        const data = await db.select()
            .from(notifications)
            .orderBy(desc(notifications.createdAt))
            .limit(50);
        return data;
    } catch (e) {
        console.error("Error fetching sent notifications:", e);
        return [];
    }
}

export async function promoteUserToAdmin(email: string) {
    try {
        await db.update(users)
            .set({ role: "admin" })
            .where(eq(users.email, email));
        return { success: true };
    } catch (e) {
        console.error("Error promoting user:", e);
        return { success: false };
    }
}

// Helper to seed some initial data for the user to see
export async function seedInitialNotifications() {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        
        const existing = await db.select().from(notifications).limit(1);
        if (existing.length > 0) return;

        const initialData = [
            {
                type: "announcement",
                title: "Welcome to TypeFlow!",
                message: "We're excited to have you here. Start typing to improve your speed!",
            },
            {
                type: "notification",
                title: "New Achievement!",
                message: "You've unlocked the 'First Steps' achievement.",
                userId: userId || undefined,
            },
            {
                type: "inbox",
                title: "System Update",
                message: "We've added a new notification system. Check it out!",
                userId: userId || undefined,
            }
        ];

        for (const item of initialData) {
            await db.insert(notifications).values(item);
        }
    } catch (e) {
        console.error("Error seeding notifications:", e);
    }
}
