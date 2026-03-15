"use client";

import React from "react";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { ScrollText, ShieldCheck, Scale, AlertCircle } from "lucide-react";

export default function TermsPage() {
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const sections = [
        {
            title: "1. Acceptance of Terms",
            icon: ShieldCheck,
            content: "By accessing and using TypeFlow, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you are prohibited from using this application."
        },
        {
            title: "2. User Conduct",
            icon: Scale,
            content: "Users agree to use TypeFlow for its intended purpose: improving and testing typing speed. Any form of automated use (bots, scripts), cheating, or disruption of the service is strictly prohibited and can result in immediate account termination."
        },
        {
            title: "3. Intellectual Property",
            icon: ScrollText,
            content: "All content, features, and functionality of TypeFlow, including but not limited to text, graphics, logos, and code, are the exclusive property of TypeFlow and its creators. Unauthorized reproduction or distribution is prohibited."
        },
        {
            title: "4. Limitation of Liability",
            icon: AlertCircle,
            content: "TypeFlow is provided 'as is' without any warranties. We are not liable for any damages arising from your use of the application, including but not limited to data loss or service interruptions."
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
                        Terms of Service
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
                        If you have any questions regarding these Terms of Service, please contact us at{" "}
                        <a
                            href="mailto:legal@typeflow.com"
                            className="underline underline-offset-4 hover:opacity-100 transition-opacity"
                            style={{ color: activeTheme.primary }}
                        >
                            legal@typeflow.com
                        </a>.
                    </p>
                </div>
            </main>

        </div>
    );
}
