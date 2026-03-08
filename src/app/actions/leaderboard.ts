"use server";

import { redis } from "@/db/redis";
import { auth } from "@/auth";

const LEADERBOARD_KEY = "typing_leaderboard_v1";

export async function saveLeaderboardResult(wpm: number) {
    const session = await auth();
    if (!session?.user) return { error: "You must be signed in to submit results." };
    if (!process.env.UPSTASH_REDIS_REST_URL) return { error: "Redis not configured." };

    const userId = session.user.id;
    const userName = session.user.name || "Anonymous";

    // Use ZADD to add the user's WPM to the leaderboard.
    // The member is the userId:name to handle duplicate IDs and show names.
    // We use the score as WPM.
    try {
        await redis.zadd(LEADERBOARD_KEY, {
            score: wpm,
            member: `${userId}:${userName}`,
        });
        return { success: true };
    } catch (error) {
        console.error("Redis Error:", error);
        return { error: "Failed to update leaderboard." };
    }
}

export async function getTopLeaderboard(limit = 10) {
    if (!process.env.UPSTASH_REDIS_REST_URL) return [];

    try {
        // ZREVRANGE returns the leaderboard from highest to lowest score.
        // We use WITHSCORES to get both the member and the WPM.
        const results = await redis.zrange(LEADERBOARD_KEY, 0, limit - 1, {
            rev: true,
            withScores: true,
        });

        const leaderboard = [];
        for (let i = 0; i < results.length; i += 2) {
            const member = results[i] as string;
            const score = results[i + 1] as number;
            const [userId, name] = member.split(":");
            leaderboard.push({ userId, name, wpm: score });
        }

        return leaderboard;
    } catch (error) {
        console.error("Redis Fetch Error:", error);
        return [];
    }
}
