"use server";

import { db } from "@/db";
import { referrals, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/auth";

/**
 * Retrieves the total number of users successfully invited by the current authenticated user.
 */
export async function getReferralCount() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { count: 0, error: "Unauthorized" };
    }

    try {
        const results = await db
            .select()
            .from(referrals)
            .where(eq(referrals.referrerId, userId));
            
        return { count: results.length, success: true };
    } catch (error) {
        console.error("Error fetching referrals:", error);
        return { count: 0, error: "Failed to fetch referrals" };
    }
}

/**
 * Retrieves the list of users who joined via the current user's invite link.
 */
export async function getReferralHistory() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const results = await db
            .select({
                id: users.id,
                name: users.name,
                joinedAt: users.joinedAt,
            })
            .from(referrals)
            .innerJoin(users, eq(referrals.referredId, users.id))
            .where(eq(referrals.referrerId, userId))
            .orderBy(desc(referrals.createdAt));
            
        return { success: true, data: results };
    } catch (error) {
        console.error("Error fetching referral history:", error);
        return { error: "Failed to fetch referral history" };
    }
}

/**
 * Shared logic to link a new user to a referrer and award XP/Achievements.
 */
export async function processReferral(referredId: string, referrerId?: string) {
    if (!referrerId || !referredId || referrerId === referredId) return;

    try {
        // 1. Verify referrer exists
        const [referrer] = await db.select().from(users).where(eq(users.id, referrerId));
        if (!referrer) return;

        // 2. Link the referral
        await db.insert(referrals).values({
            referrerId: referrer.id,
            referredId: referredId,
        }).onConflictDoNothing();

        // 3. Award XP (+50 for referred, +10 for referrer)
        await db.update(users).set({ xp: sql`${users.xp} + 50` }).where(eq(users.id, referredId));
        await db.update(users).set({ xp: sql`${users.xp} + 10` }).where(eq(users.id, referrer.id));

        // 4. Grant achievements
        // a_friends_call for the new user
        const { userAchievements } = await import("@/db/schema");
        await db.insert(userAchievements).values({
            userId: referredId,
            achievementId: "a_friends_call"
        }).onConflictDoNothing();

        // the_recruiter & community_builder for the referrer
        const results = await db.select().from(referrals).where(eq(referrals.referrerId, referrer.id));
        const inviteCount = results.length;

        if (inviteCount >= 1) {
            await db.insert(userAchievements).values({
                userId: referrer.id,
                achievementId: "the_recruiter"
            }).onConflictDoNothing();
        }
        if (inviteCount >= 5) {
            await db.insert(userAchievements).values({
                userId: referrer.id,
                achievementId: "community_builder"
            }).onConflictDoNothing();
        }

        console.log(`[REFERRAL] Linked ${referredId} to ${referrerId}`);
    } catch (error) {
        console.error("[REFERRAL] Error processing referral:", error);
    }
}
