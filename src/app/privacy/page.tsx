"use client";

import React from "react";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { Eye, Database, Share2, Cookie } from "lucide-react";

export default function PrivacyPage() {
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const sections = [
        {
            title: "1. Data Collection",
            icon: Eye,
            content: "We collect information you provide directly to us when you create an account, such as your name, email address (via OAuth providers like Google or GitHub), and profile picture. We also collect your typing test results, including WPM, accuracy, and consistency stats."
        },
        {
            title: "2. How We Use Your Information",
            icon: Database,
            content: "Your data is used to provide personality and progress tracking. Typing results are used to populate leaderboards and your personal history. Email addresses are used for authentication and account-related notifications."
        },
        {
            title: "3. Information Sharing",
            icon: Share2,
            content: "We do not sell your personal data. Your username, profile picture, and typing performance are publicly visible on the leaderboards. We may share anonymous, aggregated data for analytical purposes to improve the application."
        },
        {
            title: "4. Cookies & Storage",
            icon: Cookie,
            content: "We use essential cookies for session management and authentication. Local storage is used to remember your theme preferences and game configurations on your device."
        }
    ];

    return (
        <div
            className="min-h-screen flex flex-col transition-colors duration-500 pt-1 sm:pt-1.5 md:pt-3 px-[var(--content-px)]"
            style={{ backgroundColor: activeTheme.bg }}
        >

            <main className="flex-1 w-full max-w-4xl mx-auto py-12 md:py-20">
                <div className="mb-12">
                    <h1
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                        style={{ color: activeTheme.primary }}
                    >
                        Privacy Policy
                    </h1>
                    <p
                        className="text-sm font-mono opacity-60"
                        style={{ color: activeTheme.textDim }}
                    >
                        Last updated: March 10, 2026
                    </p>
                </div>

                <div className="space-y-12">
                    {sections.map((section, idx) => (
                        <section key={idx} className="group">
                            <div className="flex items-center gap-3 mb-4">
                                <section.icon
                                    className="w-6 h-6 transition-transform group-hover:scale-110"
                                    style={{ color: activeTheme.primary }}
                                />
                                <h2
                                    className="text-xl font-bold tracking-tight"
                                    style={{ color: activeTheme.text }}
                                >
                                    {section.title}
                                </h2>
                            </div>
                            <div
                                className="pl-9 text-base leading-relaxed opacity-80"
                                style={{ color: activeTheme.textDim }}
                            >
                                {section.content}
                            </div>
                        </section>
                    ))}
                </div>

                <div
                    className="mt-16 p-8 rounded-2xl border transition-all duration-300 backdrop-blur-sm"
                    style={{
                        backgroundColor: `${activeTheme.bg}80`,
                        borderColor: `${activeTheme.primary}20`
                    }}
                >
                    <p
                        className="text-sm leading-relaxed"
                        style={{ color: activeTheme.textDim }}
                    >
                        For any privacy-related inquiries, please reach out to our privacy officer at{" "}
                        <a
                            href="mailto:privacy@typeflow.com"
                            className="underline underline-offset-4 hover:opacity-100 transition-opacity"
                            style={{ color: activeTheme.primary }}
                        >
                            privacy@typeflow.com
                        </a>.
                    </p>
                </div>
            </main>

        </div>
    );
}
