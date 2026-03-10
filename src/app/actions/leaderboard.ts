"use server";

import { redis } from "@/db/redis";
import { auth } from "@/auth";

const getLeaderboardKeys = (type: string, gameMode: string, config: string, language: string) => {
    let timeSuffix = "";
    const now = new Date();

    if (type === "daily") {
        timeSuffix = `_${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
    } else if (type === "weekly") {
        // Simple ISO week-like suffix
        const startOfYear = new Date(now.getUTCFullYear(), 0, 1);
        const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
        timeSuffix = `_${now.getUTCFullYear()}_w${weekNum}`;
    }

    return {
        wpm: `typing_leaderboard_${language}_${gameMode}_${config}_${type}${timeSuffix}_wpm`,
        metadata: `typing_leaderboard_${language}_${gameMode}_${config}_${type}${timeSuffix}_metadata`
    };
};

export async function saveLeaderboardResult(
    wpm: number,
    accuracy: number,
    rawWpm: number,
    consistency: number,
    missedChars: number = 0,
    type: "allTime" | "weekly" | "daily" = "allTime",
    gameMode: string = "time",
    config: string = "15",
    language: string = "english"
) {
    const session = await auth();
    if (!session?.user) return { error: "You must be signed in to submit results." };
    if (!process.env.UPSTASH_REDIS_REST_URL) return { error: "Redis not configured." };

    const userId = session.user.id;
    if (!userId) return { error: "Invalid user session." };

    const userName = session.user.name || "Anonymous";
    const userImage = session.user.image || "";
    const userLevel = (session.user as { level?: number }).level || 1;

    const { wpm: wpmKey, metadata: metaKey } = getLeaderboardKeys(type, gameMode, config, language);

    try {
        // Only update if it's the user's best WPM for this category/mode/language
        const currentBest = await redis.zscore(wpmKey, userId);

        if (!currentBest || wpm > Number(currentBest)) {
            await redis.zadd(wpmKey, { score: wpm, member: userId });

            const metadata = {
                userId,
                name: userName,
                image: userImage,
                level: userLevel,
                wpm,
                accuracy,
                rawWpm,
                consistency,
                missedChars,
                date: new Date().toISOString()
            };

            await redis.hset(metaKey, { [userId]: JSON.stringify(metadata) });
        }

        return { success: true };
    } catch (error) {
        console.error("Redis Error:", error);
        return { error: "Failed to update leaderboard." };
    }
}

export async function getTopLeaderboard(
    limit = 50,
    type: "allTime" | "weekly" | "daily" = "allTime",
    gameMode: string = "time",
    config: string = "15",
    language: string = "english"
) {
    if (!process.env.UPSTASH_REDIS_REST_URL) return [];

    const { wpm: wpmKey, metadata: metaKey } = getLeaderboardKeys(type, gameMode, config, language);

    try {
        const userIds = await redis.zrange(wpmKey, 0, limit - 1, {
            rev: true,
        }) as string[];

        if (!userIds || userIds.length === 0) return [];

        // Fetch metadata for all these users
        const metadataList = await redis.hmget(metaKey, ...userIds);

        if (!metadataList) return [];

        // Robust handling of metadataList - handle both array and object responses
        const results = Array.isArray(metadataList)
            ? metadataList
            : Object.values(metadataList as Record<string, string | null>);

        return results
            .filter((m): m is string => !!m && typeof m === 'string')
            .map(m => {
                try {
                    return JSON.parse(m);
                } catch (e) {
                    console.error("JSON Parse Error:", e, m);
                    return null;
                }
            })
            .filter(item => item !== null);
    } catch (error) {
        console.error("Redis Fetch Error:", error);
        return [];
    }
}
