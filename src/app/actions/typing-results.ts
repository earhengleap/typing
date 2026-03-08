"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { typingResults } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { RunHistory } from "@/hooks/use-monkeytype-store";

export async function saveTypingResult(run: Omit<RunHistory, "id" | "date">) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.insert(typingResults).values({
            userId: session.user.id,
            wpm: run.wpm,
            rawWpm: run.rawWpm,
            accuracy: run.accuracy,
            mode: run.mode,
            config: run.config,
            language: run.language,
            theme: run.theme,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to save typing result:", error);
        return { success: false, error: "Database error" };
    }
}

export async function getUserTypingHistory() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, data: [] };

    try {
        const results = await db
            .select()
            .from(typingResults)
            .where(eq(typingResults.userId, session.user.id))
            .orderBy(desc(typingResults.createdAt))
            .limit(50); // Fetch last 50 runs

        // Map DB fields back to Zustand store schema
        const history = results.map((r) => ({
            id: r.id,
            wpm: r.wpm,
            rawWpm: r.rawWpm,
            accuracy: r.accuracy,
            mode: r.mode as "time" | "words",
            config: r.config as 15 | 30 | 60 | 120 | 10 | 25 | 50 | 100,
            language: r.language as "english" | "khmer",
            theme: r.theme as any,
            date: r.createdAt.getTime(),
        }));

        return { success: true, data: history };
    } catch (error) {
        console.error("Failed to fetch typing history:", error);
        return { success: false, error: "Database error" };
    }
}
