"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { typingResults, users, userAchievements } from "@/db/schema";
import { desc, eq, sql, and } from "drizzle-orm";
import type { RunHistory, Theme } from "@/hooks/use-monkeytype-store";

export async function saveTypingResult(run: Omit<RunHistory, "id" | "date"> & { duration: number; consistency: number; missedChars?: number }) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // 1. Save the result
        await db.insert(typingResults).values({
            userId: session.user.id,
            wpm: run.wpm,
            rawWpm: run.rawWpm,
            accuracy: run.accuracy,
            consistency: run.consistency,
            mode: run.mode,
            config: run.config,
            language: run.language,
            theme: run.theme,
            duration: run.duration,
            missedChars: run.missedChars || 0,
        });

        // 2. Fetch current user stats for xp/level/streak logic
        const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
        if (!user) return { success: false, error: "User not found" };

        const now = new Date();
        let newStreak = user.streak;
        const lastTest = user.lastTestAt;

        if (lastTest) {
            const lastTestDate = new Date(lastTest);
            const isToday = lastTestDate.toDateString() === now.toDateString();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const isYesterday = lastTestDate.toDateString() === yesterday.toDateString();

            if (isYesterday) {
                newStreak += 1;
            } else if (!isToday) {
                newStreak = 1; // Reset to 1 if more than a day missed
            }
        } else {
            newStreak = 1; // First test
        }

        // Calculate XP Gain: Base 5 + (WPM * Accuracy / 10)
        const performanceBonus = Math.floor((run.wpm * (run.accuracy / 100)));
        const xpGain = 5 + performanceBonus;
        const newXp = user.xp + xpGain;
        const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1; // Level up slower as you go

        const testsCompleted = user.testsCompleted + 1;
        const totalTypingTime = user.typingTime + run.duration;

        // 3. Achievement Unlocking Logic
        const achievementsToUnlock: string[] = [];

        // Speed Achievements
        if (run.wpm >= 60) achievementsToUnlock.push("speed_demon_60");
        if (run.wpm >= 100) achievementsToUnlock.push("speed_demon_100");
        if (run.wpm >= 120) achievementsToUnlock.push("speed_demon_120");

        // Accuracy Achievements
        if (run.accuracy === 100 && (run.config >= 15 || (run.mode === "words" && run.config >= 10))) {
            achievementsToUnlock.push("sniper");
        }

        // Milestone Achievements
        if (testsCompleted >= 1) achievementsToUnlock.push("first_bite");
        if (testsCompleted >= 100) achievementsToUnlock.push("century");
        if (totalTypingTime >= 3600) achievementsToUnlock.push("marathoner");
        if (newStreak >= 7) achievementsToUnlock.push("dedicated_7");

        // Filter out already unlocked achievements
        const existingAchievements = await db.select({ id: userAchievements.achievementId })
            .from(userAchievements)
            .where(eq(userAchievements.userId, session.user.id));

        const existingIds = existingAchievements.map(a => a.id);
        const newAchievements = achievementsToUnlock.filter(id => !existingIds.includes(id));

        if (newAchievements.length > 0) {
            await db.insert(userAchievements).values(
                newAchievements.map(id => ({
                    userId: session.user.id!,
                    achievementId: id,
                }))
            );
        }

        // 4. Update user stats
        await db.update(users)
            .set({
                testsCompleted: testsCompleted,
                typingTime: totalTypingTime,
                xp: newXp,
                level: newLevel,
                streak: newStreak,
                lastTestAt: now,
            })
            .where(eq(users.id, session.user.id));

        return {
            success: true,
            xpGained: xpGain,
            levelUp: newLevel > user.level,
            newAchievements: newAchievements
        };
    } catch (error) {
        console.error("Failed to save typing result:", error);
        return { success: false, error: "Database error" };
    }
}

export async function incrementTestsStarted() {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    try {
        await db.update(users)
            .set({ testsStarted: sql`${users.testsStarted} + 1` })
            .where(eq(users.id, session.user.id));
        return { success: true };
    } catch {
        return { success: false };
    }
}

export async function updateAccount(data: { bio?: string; keyboard?: string }) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.update(users)
            .set({ bio: data.bio, keyboard: data.keyboard })
            .where(eq(users.id, session.user.id));
        return { success: true };
    } catch {
        return { success: false, error: "Failed to update profile" };
    }
}

export async function getUserTypingHistory(userId?: string) {
    let targetId = userId;

    if (!targetId) {
        const session = await auth();
        if (!session?.user?.id) return { success: false, data: [] };
        targetId = session.user.id;
    }

    if (typeof targetId !== 'string') {
        console.error("Invalid userId passed to getUserTypingHistory:", targetId);
        return { success: false, data: [] };
    }

    try {
        const results = await db
            .select()
            .from(typingResults)
            .where(eq(typingResults.userId, targetId))
            .orderBy(desc(typingResults.createdAt))
            .limit(100);

        const history = results.map((r) => ({
            id: r.id,
            wpm: r.wpm,
            rawWpm: r.rawWpm,
            accuracy: r.accuracy,
            mode: r.mode as "time" | "words",
            config: r.config as 15 | 30 | 60 | 120 | 10 | 25 | 50 | 100,
            language: r.language as "english" | "khmer",
            theme: r.theme as Theme,
            consistency: r.consistency || 0,
            date: r.createdAt.getTime(),
        }));

        const user = await db.select().from(users).where(eq(users.id, targetId));

        return { success: true, data: history, user: user[0] };
    } catch (error: unknown) {
        console.error("Failed to fetch typing history for user:", targetId, error);
        return { success: false, error: (error as Error).message || "Database error" };
    }
}
export async function runManualMigration() {
    try {
        console.log("Running in-app migration...");
        await db.execute(sql`ALTER TABLE "typing_result" RENAME COLUMN "userId" TO "user_id"`);
        console.log("Renamed userId to user_id");
    } catch (e) {
        console.log("Rename skipped:", (e as Error).message);
    }

    const cols = [
        "bio", "keyboard", "level", "xp", "streak",
        "tests_started", "tests_completed", "typing_time",
        "last_test_at", "joined_at"
    ];
    const typingResultCols = ["duration", "missed_chars"];

    for (const col of cols) {
        try {
            let type = "text";
            if (["level", "xp", "streak", "tests_started", "tests_completed", "typing_time"].includes(col)) {
                type = "integer DEFAULT 0 NOT NULL";
            } else if (["last_test_at", "joined_at"].includes(col)) {
                type = "timestamp";
            }
            if (col === "level") type = "integer DEFAULT 1 NOT NULL";
            if (col === "joined_at") type = "timestamp DEFAULT now() NOT NULL";

            await db.execute(sql.raw(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "${col}" ${type}`));
            console.log(`Added column ${col} to user table`);
        } catch (e) {
            console.log(`Failed to add ${col} to user table:`, (e as Error).message);
        }
    }

    for (const col of typingResultCols) {
        try {
            await db.execute(sql.raw(`ALTER TABLE "typing_result" ADD COLUMN IF NOT EXISTS "${col}" integer`));
            console.log(`Added column ${col} to typing_result table`);
        } catch (e) {
            console.log(`Failed to add ${col} to typing_result table:`, (e as Error).message);
        }
    }

    return { success: true };
}
export async function getUserAchievements(userId?: string) {
    let targetId = userId;
    if (!targetId) {
        const session = await auth();
        if (!session?.user?.id) return { success: false, data: [] };
        targetId = session.user.id;
    }

    try {
        const results = await db
            .select()
            .from(userAchievements)
            .where(eq(userAchievements.userId, targetId));
        return { success: true, data: results };
    } catch (error) {
        console.error("Failed to query achievements:", error);
        return { success: false, data: [] };
    }
}
export async function updateUserSettings(settings: Record<string, unknown>) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.update(users)
            .set({ settings: settings })
            .where(eq(users.id, session.user.id));
        return { success: true };
    } catch (error) {
        console.error("Failed to update settings:", error);
        return { success: false, error: "Database error" };
    }
}
export async function getGhostRun(mode: string, config: number, language: string) {
    try {
        const session = await auth();

        const results = await db
            .select({
                wpm: typingResults.wpm,
                accuracy: typingResults.accuracy,
                userId: typingResults.userId,
                userName: users.name,
            })
            .from(typingResults)
            .innerJoin(users, eq(typingResults.userId, users.id))
            .where(
                and(
                    eq(typingResults.mode, mode),
                    eq(typingResults.config, config),
                    eq(typingResults.language, language),
                    sql`${typingResults.wpm} > 10`
                )
            )
            .orderBy(sql`RANDOM()`)
            .limit(1);

        if (results.length > 0) {
            const ghost = results[0];
            // If it's the current user's run, show "Personal Best" (or similar), 
            // otherwise show "Ghost" for privacy as requested.
            const isMe = session?.user?.id === ghost.userId;

            return {
                success: true,
                ghost: {
                    wpm: ghost.wpm,
                    accuracy: ghost.accuracy,
                    userName: isMe ? "Your Personal Best" : "Ghost"
                }
            };
        }
        return { success: false, error: "No ghosts found" };
    } catch (error) {
        console.error("Failed to fetch ghost run:", error);
        return { success: false, error: "Database error" };
    }
}
