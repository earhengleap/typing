"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Leaderboard } from "@/components/Leaderboard";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";

function LeaderboardPageContent() {
    const searchParams = useSearchParams();
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const mode = (searchParams.get("mode") as "time" | "words") || "time";
    const config = searchParams.get("config") || (mode === "words" ? "25" : "15");
    const type = (searchParams.get("type") as "allTime" | "weekly" | "daily") || "allTime";
    const lang = (searchParams.get("lang") as "english" | "khmer") || "english";

    return (
        <main
            className="min-h-screen transition-colors duration-500 flex flex-col items-center pt-1 sm:pt-1.5 md:pt-3 px-[var(--content-px)]"
            style={{
                backgroundColor: activeTheme.bg,
                color: activeTheme.text,
                fontFamily: "'Inter', sans-serif"
            }}
        >

            <div className="w-full">
                <Leaderboard
                    theme={activeTheme}
                    isModal={false}
                    initialType={type}
                    initialMode={mode}
                    initialConfig={config}
                    initialLanguage={lang === "khmer" ? "khmer" : "english"}
                />
            </div>

            <div className="mt-8 text-[10px] font-bold tracking-[0.3em] uppercase opacity-20" style={{ color: activeTheme.textDim }}>
                TypeFlow Leaderboards
            </div>

        </main>
    );
}

export default function LeaderboardsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LeaderboardPageContent />
        </Suspense>
    );
}
