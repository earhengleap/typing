"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthenticInfo } from "@/components/icons/AuthenticInfo";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import Link from "next/link";
import { motion } from "framer-motion";
import { HandHeart, AlignLeft as AlignLeftIcon, Keyboard as KeyboardIcon, BarChart3 as ChartBarIcon } from "lucide-react";
import { AuthenticMail } from "@/components/icons/AuthenticMail";
import { AuthenticGithub } from "@/components/icons/AuthenticGithub";
import { AuthenticDiscord } from "@/components/icons/AuthenticDiscord";
import { AuthenticSupport } from "@/components/icons/AuthenticSupport";
import { getGlobalStats, getActivityGraph, getWpmDistribution } from "@/app/actions/global-stats";

export default function AboutPage() {
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const [mounted, setMounted] = useState(false);
    const [globalStats, setGlobalStats] = useState({ testsStarted: 0, testsCompleted: 0, typingTime: 0 });
    const [graphData, setGraphData] = useState<number[]>([]);
    const [wpmData, setWpmData] = useState<{ distribution: number[], total: number }>({ distribution: [], total: 0 });
    const [statsLoaded, setStatsLoaded] = useState(false);

    useEffect(() => {
        setMounted(true);
        Promise.all([
            getGlobalStats(), 
            getActivityGraph(),
            getWpmDistribution()
        ]).then(([stats, graph, wpm]) => {
            setGlobalStats(stats);
            setGraphData(graph);
            setWpmData(wpm);
            setStatsLoaded(true);
        });
    }, []);

    if (!mounted) return null;

    return (
        <div
            className="min-h-screen flex flex-col font-roboto selection:bg-[var(--mt-primary-20)] transition-colors duration-500 pt-1 sm:pt-1.5 md:pt-3 px-[var(--content-px)]"
            style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}
        >
            <Header activeTheme={activeTheme} />

            <main className="flex-1 w-full max-w-[1050px] mx-auto flex flex-col py-10 overflow-y-auto overflow-x-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col gap-20 leading-relaxed pb-20"
                >
                    {/* TRIBUTE HEADER */}
                    <div className="flex flex-col gap-1">
                        <p className="text-sm opacity-50" style={{ color: activeTheme.textDim }}>Created with love by Hengleap. Launched on 08th of March 2026.</p>
                    </div>

                    {/* TOP STATS */}
                    <section className="flex flex-col gap-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <StatCard 
                                label="tests started" 
                                value={globalStats.testsStarted} 
                                theme={activeTheme} 
                                loaded={statsLoaded} 
                            />
                            <StatCard 
                                label="tests completed" 
                                value={globalStats.testsCompleted} 
                                theme={activeTheme} 
                                loaded={statsLoaded} 
                            />
                            <StatCard 
                                label="typing time" 
                                value={globalStats.typingTime} 
                                theme={activeTheme} 
                                loaded={statsLoaded} 
                                isTime 
                            />
                        </div>

                        {/* WPM DISTRIBUTION GRAPH */}
                        <div className="flex flex-col gap-4 mt-4">
                            <p className="text-xs opacity-50" style={{ color: activeTheme.textDim }}>
                                {(wpmData.total / 1000).toFixed(1)} thousand total results
                            </p>
                            <div className="h-[250px] w-full flex items-end gap-[2px]">
                                {statsLoaded ? (
                                    wpmData.distribution.map((count, i) => {
                                        const maxCount = Math.max(...wpmData.distribution, 1);
                                        const height = (count / maxCount) * 100;
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${height}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.02 }}
                                                    className="w-full relative rounded-t-[2px]"
                                                    style={{ backgroundColor: activeTheme.primary }}
                                                >
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                        {count} results
                                                    </div>
                                                </motion.div>
                                                <div className="text-[9px] opacity-30 mt-4 whitespace-nowrap rotate-45 origin-left" style={{ color: activeTheme.textDim }}>
                                                    {i * 10}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" />
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ABOUT CONTENT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
                        {/* about */}
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <AuthenticInfo className="w-5 h-5" style={{ color: activeTheme.primary }} />
                                <h2 className="text-2xl font-bold" style={{ color: activeTheme.textDim }}>about</h2>
                            </div>
                            <p className="text-base opacity-80" style={{ color: activeTheme.text }}>
                                Monkeytype is a minimalistic, customizable typing website, providing each user with a highly adjustable and pleasant experience.
                            </p>
                        </section>

                        {/* word set */}
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <AlignLeftIcon className="w-5 h-5" style={{ color: activeTheme.primary }} />
                                <h2 className="text-2xl font-bold" style={{ color: activeTheme.textDim }}>word set</h2>
                            </div>
                            <p className="text-base opacity-80" style={{ color: activeTheme.text }}>
                                By default, this website uses the most common 200 English words. You can change this in the settings or the navigation bar to use expanded word sets, or even other languages.
                            </p>
                        </section>

                        {/* keybinds */}
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <KeyboardIcon className="w-5 h-5" style={{ color: activeTheme.primary }} />
                                <h2 className="text-2xl font-bold" style={{ color: activeTheme.textDim }}>keybinds</h2>
                            </div>
                            <div className="flex flex-col gap-2">
                                <ShortcutRow keys={["tab"]} plus={["enter"]} desc="restart test" theme={activeTheme} />
                                <ShortcutRow keys={["esc"]} desc="command line" theme={activeTheme} />
                                <ShortcutRow keys={["ctrl", "shift", "p"]} desc="command line" theme={activeTheme} />
                            </div>
                        </section>

                        {/* results screen */}
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <ChartBarIcon className="w-5 h-5" style={{ color: activeTheme.primary }} />
                                <h2 className="text-2xl font-bold" style={{ color: activeTheme.textDim }}>results screen</h2>
                            </div>
                            <p className="text-base opacity-80" style={{ color: activeTheme.text }}>
                                After completing a test, you are presented with a lot of data, including WPM, accuracy, consistency, and a chart showing your performance during the test.
                            </p>
                        </section>

                        {/* support */}
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <AuthenticSupport className="w-5 h-5" style={{ color: activeTheme.primary }} />
                                <h2 className="text-2xl font-bold" style={{ color: activeTheme.textDim }}>support</h2>
                            </div>
                            <p className="text-base opacity-80" style={{ color: activeTheme.text }}>
                                If you enjoy this project and would like to support its continued development, please consider donating.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <ExternLink href="https://ko-fi.com/" icon={HandHeart} label="Donate" theme={activeTheme} />
                            </div>
                        </section>

                        {/* contact */}
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <AuthenticMail className="w-5 h-5" style={{ color: activeTheme.primary }} />
                                <h2 className="text-2xl font-bold" style={{ color: activeTheme.textDim }}>contact</h2>
                            </div>
                            <p className="text-base opacity-80" style={{ color: activeTheme.text }}>
                                If you encounter a bug, or have a feature request - join the Discord server, send me an email, or create an issue on GitHub.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <ExternLink href="https://discord.gg/typeflow" icon={AuthenticDiscord} label="Discord" theme={activeTheme} />
                                <ExternLink href="mailto:support@typeflow.com" icon={AuthenticMail} label="Email" theme={activeTheme} />
                                <ExternLink href="https://github.com/earhengleap/typing/issues" icon={AuthenticGithub} label="GitHub" theme={activeTheme} />
                            </div>
                        </section>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}

// -------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------

function StatCard({ label, value, theme, loaded, isTime = false }: { 
    label: string, 
    value: number, 
    theme: any, 
    loaded: boolean,
    isTime?: boolean
}) {
    let displayValue = "0.00";
    let unit = "million";

    if (loaded) {
        if (isTime) {
            // Typing time in days
            const days = value / (3600 * 24);
            if (days >= 1000000) {
                displayValue = (days / 1000000).toFixed(2);
                unit = "million days";
            } else if (days >= 1000) {
                displayValue = (days / 1000).toFixed(2);
                unit = "thousand days";
            } else {
                displayValue = Math.floor(days).toString();
                unit = "days";
            }
        } else {
            // Numbers (started/completed)
            if (value >= 1000000000) {
                displayValue = (value / 1000000000).toFixed(2);
                unit = "billion";
            } else if (value >= 1000000) {
                displayValue = (value / 1000000).toFixed(2);
                unit = "million";
            } else if (value >= 1000) {
                displayValue = (value / 1000).toFixed(2);
                unit = "thousand";
            } else {
                displayValue = value.toString();
                unit = "";
            }
        }
    }

    return (
        <div className="flex flex-col" style={{ opacity: loaded ? 1 : 0.5 }}>
            <span className="text-xs font-bold opacity-50 mb-4 uppercase tracking-widest" style={{ color: theme.textDim }}>{label}</span>
            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold" style={{ color: theme.text }}>
                    {loaded ? displayValue : "0.00"}
                </span>
                <span className="text-2xl font-bold" style={{ color: theme.text }}>{unit}</span>
            </div>
        </div>
    );
}

function ExternLink({ href, icon: Icon, label, theme }: { href: string, icon: any, label: string, theme: any }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/5 hover:bg-black/10 transition-colors duration-200 group"
        >
            <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: theme.primary }} />
            <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: theme.text }}>
                {label}
            </span>
        </a>
    );
}

function ShortcutRow({ keys, desc, theme, plus }: { keys: string[], desc: string, theme: any, plus?: string[] }) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
                {keys.map((k, i) => (
                    <React.Fragment key={k}>
                        <kbd
                            className="px-2 py-1 rounded text-xs font-bold shadow-sm uppercase whitespace-nowrap"
                            style={{ backgroundColor: `${theme.textDim}20`, color: theme.text }}
                        >
                            {k}
                        </kbd>
                        {i < keys.length - 1 && <span className="text-xs opacity-50" style={{ color: theme.textDim }}>+</span>}
                    </React.Fragment>
                ))}
                
                {plus && plus.length > 0 && (
                    <>
                        <span className="text-xs opacity-50 mx-1" style={{ color: theme.textDim }}>or</span>
                        {plus.map((k, i) => (
                            <React.Fragment key={k}>
                                <kbd
                                    className="px-2 py-1 rounded text-xs font-bold shadow-sm uppercase whitespace-nowrap"
                                    style={{ backgroundColor: `${theme.textDim}20`, color: theme.text }}
                                >
                                    {k}
                                </kbd>
                                {i < plus.length - 1 && <span className="text-xs opacity-50" style={{ color: theme.textDim }}>+</span>}
                            </React.Fragment>
                        ))}
                    </>
                )}
            </div>
            <span className="text-sm opacity-60 ml-1 sm:ml-0" style={{ color: theme.textDim }}>- {desc}</span>
        </div>
    );
}


