"use server";

import { db } from "@/db";
import { notifications, users, userNotificationStates } from "@/db/schema";
import { eq, and, or, isNull, desc, inArray, sql } from "drizzle-orm";
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

        // Join with userNotificationStates if userId is present to get per-user read/dismissed state
        let data;
        if (userId) {
            data = await db.select({
                id: notifications.id,
                userId: notifications.userId,
                type: notifications.type,
                title: notifications.title,
                message: notifications.message,
                // Use per-user read status if it exists, otherwise use terminal-level read status
                read: sql<number>`COALESCE(${userNotificationStates.read}, ${notifications.read})`.mapWith(Number),
                priority: notifications.priority,
                createdAt: notifications.createdAt,
                dismissed: sql<number>`COALESCE(${userNotificationStates.dismissed}, 0)`.mapWith(Number),
            })
            .from(notifications)
            .leftJoin(userNotificationStates, and(
                eq(userNotificationStates.notificationId, notifications.id),
                eq(userNotificationStates.userId, userId)
            ))
            .where(and(
                whereClause,
                sql`COALESCE(${userNotificationStates.dismissed}, 0) = 0`
            ))
            .orderBy(desc(notifications.createdAt));
        } else {
            data = await db.select()
                .from(notifications)
                .where(whereClause)
                .orderBy(desc(notifications.createdAt));
        }

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
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) return { success: false };

        // Check if the notification is a global announcement
        const [notification] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
        
        if (notification && notification.userId === null) {
            // It's a global announcement, upsert per-user state
            await db.insert(userNotificationStates)
                .values({
                    notificationId: id,
                    userId: userId,
                    read: 1
                })
                .onConflictDoUpdate({
                    target: [userNotificationStates.userId, userNotificationStates.notificationId],
                    set: { read: 1, updatedAt: new Date() }
                });
        } else {
            // Direct notification, update directly
            await db.update(notifications)
                .set({ read: 1 })
                .where(eq(notifications.id, id));
        }
        
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

        // 1. Mark direct notifications as read
        let directWhere = eq(notifications.userId, userId);
        if (type) {
            directWhere = and(directWhere, eq(notifications.type, type)) as any;
        }
        await db.update(notifications).set({ read: 1 }).where(directWhere);

        // 2. Mark announcements as read in user state
        if (!type || type === "announcement") {
            const announcements = await db.select({ id: notifications.id })
                .from(notifications)
                .where(isNull(notifications.userId));
            
            for (const a of announcements) {
                await db.insert(userNotificationStates)
                    .values({ notificationId: a.id, userId: userId, read: 1 })
                    .onConflictDoUpdate({
                        target: [userNotificationStates.userId, userNotificationStates.notificationId],
                        set: { read: 1, updatedAt: new Date() }
                    });
            }
        }
        
        return { success: true };
    } catch (e) {
        console.error("Error marking all as read:", e);
        return { success: false };
    }
}

export async function deleteNotification(id: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        // @ts-ignore
        const role = session?.user?.role;
        if (!userId) return { success: false };

        const [notification] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
        if (!notification) return { success: false };

        const isAdmin = role === "admin" || role === "superadmin";

        if (notification.userId === null) {
            if (isAdmin) {
                // Admin deletes for everyone
                await db.delete(notifications).where(eq(notifications.id, id));
            } else {
                // User only dismisses for themselves
                await db.insert(userNotificationStates)
                    .values({ notificationId: id, userId: userId, dismissed: 1 })
                    .onConflictDoUpdate({
                        target: [userNotificationStates.userId, userNotificationStates.notificationId],
                        set: { dismissed: 1, updatedAt: new Date() }
                    });
            }
        } else {
            // Direct notification
            let whereClause;
            if (isAdmin) {
                whereClause = eq(notifications.id, id);
            } else {
                whereClause = and(eq(notifications.id, id), eq(notifications.userId, userId));
            }
            await db.delete(notifications).where(whereClause);
        }
            
        return { success: true };
    } catch (e) {
        console.error("Error deleting notification:", e);
        return { success: false };
    }
}

export async function clearAllNotifications(type?: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        // @ts-ignore
        const role = session?.user?.role;
        if (!userId) return { success: false };

        const isAdmin = role === "admin" || role === "superadmin";

        if (type === "announcement" || !type) {
            if (isAdmin && type === "announcement") {
                // Admin clears all announcements globally
                await db.delete(notifications).where(isNull(notifications.userId));
            } else {
                // Regular user (or admin in user view) just dismisses them
                const announcements = await db.select({ id: notifications.id })
                    .from(notifications)
                    .where(isNull(notifications.userId));
                
                for (const a of announcements) {
                    await db.insert(userNotificationStates)
                        .values({ notificationId: a.id, userId: userId, dismissed: 1 })
                        .onConflictDoUpdate({
                            target: [userNotificationStates.userId, userNotificationStates.notificationId],
                            set: { dismissed: 1, updatedAt: new Date() }
                        });
                }
            }
        }

        // Clear direct ones
        let directWhere = eq(notifications.userId, userId);
        if (type) {
            directWhere = and(directWhere, eq(notifications.type, type)) as any;
        }
        await db.delete(notifications).where(directWhere);
        
        return { success: true };
    } catch (e) {
        console.error("Error clearing all notifications:", e);
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
    priority?: string;
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
            priority: data.priority || "info",
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

// Global broadcast to ALL users
export async function sendGlobalBroadcast(data: {
    title: string;
    message: string;
    priority: "info" | "warning" | "critical";
}) {
    return sendNotification({
        type: "announcement",
        title: data.title,
        message: data.message,
        priority: data.priority,
        userId: null // Announcement type + null userId = Every user sees it
    });
}
