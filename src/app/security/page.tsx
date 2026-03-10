"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { Shield, Lock, Server, Bug } from "lucide-react";

export default function SecurityPage() {
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const sections = [
        {
            title: "1. Data Protection",
            icon: Shield,
            content: "We use Postgres-JS and Drizzle with Neon's secure cloud infrastructure to store your typing data. All data is encrypted at rest and in transit using industry-standard protocols."
        },
        {
            title: "2. Authentication",
            icon: Lock,
            content: "TypeFlow uses NextAuth.js for secure authentication. We never store your passwords; we rely on trusted OAuth providers like Google and GitHub to verify your identity."
        },
        {
            title: "3. Infrastructure",
            icon: Server,
            content: "Our application is hosted on modern cloud platforms that provide automatic security patching and DDoS protection. We maintain minimal dependencies to reduce the attack surface."
        },
        {
            title: "4. Bug Bounty",
            icon: Bug,
            content: "We appreciate the community's help in keeping TypeFlow secure. If you discover a security vulnerability, please report it to us at security@typeflow.com. We will investigate and respond as quickly as possible."
        }
    ];

    return (
        <div
            className="min-h-screen flex flex-col transition-colors duration-500"
            style={{ backgroundColor: activeTheme.bg }}
        >
            <Header activeTheme={activeTheme} />

            <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-20">
                <div className="mb-12">
                    <h1
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                        style={{ color: activeTheme.primary }}
                    >
                        Security Practices
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
                        Found a security issue? Please contact us at{" "}
                        <a
                            href="mailto:security@typeflow.com"
                            className="underline underline-offset-4 hover:opacity-100 transition-opacity"
                            style={{ color: activeTheme.primary }}
                        >
                            security@typeflow.com
                        </a>.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
