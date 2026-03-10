"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { Footer } from "@/components/Footer";

function LeaderboardPageContent() {
    const searchParams = useSearchParams();
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const type = (searchParams.get("type") as "allTime" | "weekly" | "daily") || "allTime";
    const config = searchParams.get("config") || "15";
    const mode = (searchParams.get("mode") as "time" | "words") || "time";
    const lang = (searchParams.get("lang") as "english" | "khmer") || "english";

    return (
        <main
            className="min-h-screen transition-colors duration-500 flex flex-col items-center py-8"
            style={{
                backgroundColor: activeTheme.bg,
                color: activeTheme.text,
                fontFamily: "'Inter', sans-serif"
            }}
        >
            <Header activeTheme={activeTheme} />

            <div className="w-full max-w-5xl px-4 md:px-0">
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

            <Footer />
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
