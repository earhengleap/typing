"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { typingResults, users } from "@/db/schema";
import { desc, eq, and, sql, gte } from "drizzle-orm";

export async function getTopLeaderboard(
    limit = 50,
    type: "allTime" | "weekly" | "daily" = "allTime",
    gameMode: string = "time",
    config: string = "15",
    language: string = "english"
) {
    try {
        const now = new Date();
        let dateFilter = undefined;

        if (type === "daily") {
            const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            dateFilter = gte(typingResults.createdAt, startOfDay);
        } else if (type === "weekly") {
            const startOfWeek = new Date(now);
            const day = now.getUTCDay();
            const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to start of week (Monday)
            startOfWeek.setUTCDate(diff);
            startOfWeek.setUTCHours(0, 0, 0, 0);
            dateFilter = gte(typingResults.createdAt, startOfWeek);
        }

        const conditions = [
            eq(typingResults.mode, gameMode),
            eq(typingResults.config, Number(config)),
            eq(typingResults.language, language),
            eq(typingResults.isUnverified, false),
        ];

        if (dateFilter) {
            conditions.push(dateFilter);
        }

        // Subquery to get rank #1 per user based on WPM
        const sq = db
            .select({
                userId: typingResults.userId,
                wpm: typingResults.wpm,
                accuracy: typingResults.accuracy,
                rawWpm: typingResults.rawWpm,
                consistency: typingResults.consistency,
                missedChars: typingResults.missedChars,
                duration: typingResults.duration,
                createdAt: typingResults.createdAt,
                rn: sql<number>`row_number() over (partition by ${typingResults.userId} order by ${typingResults.wpm} desc, ${typingResults.createdAt} desc)`.as("rn"),
            })
            .from(typingResults)
            .where(and(...conditions))
            .as("sq");

        const results = await db
            .select({
                userId: sq.userId,
                name: users.name,
                image: users.image,
                level: users.level,
                wpm: sq.wpm,
                accuracy: sq.accuracy,
                rawWpm: sq.rawWpm,
                consistency: sq.consistency,
                missedChars: sq.missedChars,
                duration: sq.duration,
                date: sq.createdAt,
            })
            .from(sq)
            .innerJoin(users, eq(sq.userId, users.id))
            .where(eq(sq.rn, 1))
            .orderBy(desc(sq.wpm))
            .limit(limit);

        return results.map(r => ({
            ...r,
            wpm: Number(r.wpm),
            accuracy: Number(r.accuracy),
            rawWpm: Number(r.rawWpm),
            consistency: r.consistency ? Number(r.consistency) : null,
            duration: r.duration ? Number(r.duration) : null,
            date: r.date.toISOString(),
        }));
    } catch (error) {
        console.error("Database Leaderboard Error:", error);
        return [];
    }
}

export async function getGlobalStandingsForUser(userId: string, gameMode: string = "time", config: number = 15) {
    try {
        // 1. Get Top 3
        const top3 = await getTopLeaderboard(3, "allTime", gameMode, config.toString());

        // 2. Get User's Best in this mode
        const userBest = await db
            .select({
                wpm: typingResults.wpm,
            })
            .from(typingResults)
            .where(
                and(
                    eq(typingResults.userId, userId),
                    eq(typingResults.mode, gameMode),
                    eq(typingResults.config, Number(config)),
                    eq(typingResults.isUnverified, false)
                )
            )
            .orderBy(desc(typingResults.wpm))
            .limit(1);

        if (userBest.length === 0) {
            return { top3, rank: null, userBest: null };
        }

        const bestWpm = userBest[0].wpm;

        // 3. Calculate Rank
        // Count how many distinct users have a higher WPM than the user's best WPM in this mode
        // This is a simplified rank (dense rank style)
        const higherCount = await db
            .select({
                count: sql<number>`count(distinct ${typingResults.userId})`,
            })
            .from(typingResults)
            .where(
                and(
                    eq(typingResults.mode, gameMode),
                    eq(typingResults.config, config),
                    eq(typingResults.isUnverified, false),
                    sql`${typingResults.wpm} > ${bestWpm}`
                )
            );

        const rank = (Number(higherCount[0].count) || 0) + 1;

        return {
            top3,
            rank,
            userBest: bestWpm
        };
    } catch (error) {
        console.error("Error fetching global standings for user:", error);
        return { top3: [], rank: null, userBest: null };
    }
}
