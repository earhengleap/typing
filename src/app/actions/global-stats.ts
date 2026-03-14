"use server";

import { db } from "@/db";
import { typingResults, users } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function getGlobalStats() {
    try {
        // Total completed tests (number of rows in typingResult)
        const completedRes = await db.select({ count: sql<number>`count(*)` }).from(typingResults);
        const testsCompleted = Number(completedRes[0].count || 0);

        // Total typing time (sum of duration in typingResult)
        const durationRes = await db.select({ totalTime: sql<number>`sum(duration)` }).from(typingResults);
        const typingTimeSeconds = Number(durationRes[0].totalTime || 0);

        // Tests started (sum of tests_started in user table)
        const startedRes = await db.select({ totalStarted: sql<number>`sum(tests_started)` }).from(users);
        const userStarted = Number(startedRes[0].totalStarted || 0);

        // Anonymous started tests don't track perfectly, so we make sure the started number is
        // realistically larger or equal to completed tests as a fallback floor.
        const testsStarted = Math.max(userStarted, Math.floor(testsCompleted * 1.34));

        return {
            testsStarted,
            testsCompleted,
            typingTime: typingTimeSeconds
        };
    } catch (e) {
        console.error("Error fetching global stats:", e);
        return { testsStarted: 0, testsCompleted: 0, typingTime: 0 };
    }
}

export async function getActivityGraph() {
    try {
        // Group by day for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const result = await db.select({
            day: sql<string>`to_char(${typingResults.createdAt}, 'YYYY-MM-DD')`,
            count: sql<number>`count(*)`
        })
        .from(typingResults)
        .where(sql`${typingResults.createdAt} >= ${thirtyDaysAgo.toISOString()}`)
        .groupBy(sql`to_char(${typingResults.createdAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`to_char(${typingResults.createdAt}, 'YYYY-MM-DD')`);

        // Map them
        const activityMap = new Map();
        result.forEach((row: any) => {
            activityMap.set(row.day, Number(row.count));
        });

        // Ensure exactly 30 data points sequentially
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last30Days.push(activityMap.get(dateStr) || 0);
        }

        return last30Days;
    } catch (e) {
        console.error("Error fetching activity graph:", e);
        return new Array(30).fill(0);
    }
}

export async function getWpmDistribution() {
    try {
        // Query WPM distribution in buckets of 10
        // We'll bucket up to 200 WPM, everything above goes into 200+
        const result = await db.select({
            bucket: sql<number>`floor(${typingResults.wpm} / 10) * 10`,
            count: sql<number>`count(*)`
        })
        .from(typingResults)
        .groupBy(sql`floor(${typingResults.wpm} / 10) * 10`)
        .orderBy(sql`floor(${typingResults.wpm} / 10) * 10`);

        // Initialize buckets from 0 to 200 (Total 21 buckets: 0, 10, ..., 200)
        const distribution = new Array(21).fill(0);
        let total = 0;

        result.forEach((row: any) => {
            const bucketIndex = Math.min(Math.floor(Number(row.bucket) / 10), 20);
            distribution[bucketIndex] += Number(row.count);
            total += Number(row.count);
        });

        return {
            distribution,
            total
        };
    } catch (e) {
        console.error("Error fetching Wpm distribution:", e);
        return { distribution: new Array(21).fill(0), total: 0 };
    }
}
