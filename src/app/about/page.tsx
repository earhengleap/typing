"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthenticInfo } from "@/components/icons/AuthenticInfo";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import { AuthenticSupport } from "@/components/icons/AuthenticSupport";
import { getGlobalStats, getActivityGraph, getWpmDistribution } from "@/app/actions/global-stats";
import { Info, AlignLeft, Keyboard, BarChart3, Heart, Mail, Github, MessageSquare } from "lucide-react";

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
            className="flex-1 w-full max-w-[1050px] mx-auto px-[var(--content-px)] font-mono selection:bg-[var(--mt-primary-20)]"
            style={{ color: activeTheme.text }}
        >

            <main className="flex-1 w-full max-w-[1050px] mx-auto flex flex-col py-10 overflow-y-auto overflow-x-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col gap-20 leading-relaxed pb-20"
                >
                        <p className="text-xs opacity-50" style={{ color: activeTheme.textDim }}>created with love by hengleap. launched on 08th of march 2026.</p>

                    <section className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <StatCard label="tests started" value={globalStats.testsStarted} theme={activeTheme} loaded={statsLoaded} />
                            <StatCard label="tests completed" value={globalStats.testsCompleted} theme={activeTheme} loaded={statsLoaded} />
                            <StatCard label="typing time" value={globalStats.typingTime} theme={activeTheme} loaded={statsLoaded} isTime />
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <p className="text-[10px] opacity-40 font-bold" style={{ color: activeTheme.textDim }}>
                                {statsLoaded ? `${(wpmData.total / 1000).toFixed(1)} thousand total results` : "downloading data..."}
                            </p>
                            <div className="h-[200px] w-full flex items-end gap-[1px]">
                                {statsLoaded ? (
                                    wpmData.distribution.map((count, i) => {
                                        const maxCount = Math.max(...wpmData.distribution, 1);
                                        const height = (count / maxCount) * 100;
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${height}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.01 }}
                                                    className="w-full relative rounded-t-[1px] opacity-60 group-hover:opacity-100 transition-opacity"
                                                    style={{ backgroundColor: activeTheme.primary }}
                                                >
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[9px] font-bold bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                        {count} results ({i * 10} wpm)
                                                    </div>
                                                </motion.div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="w-full h-full animate-pulse bg-white/5 rounded" />
                                )}
                            </div>
                            <div className="flex justify-between mt-1 text-[9px] opacity-20 font-bold uppercase tracking-widest" style={{ color: activeTheme.textDim }}>
                                <span>0 wpm</span>
                                <span>100 wpm</span>
                                <span>200+ wpm</span>
                            </div>
                        </div>
                    </section>

                    {/* ABOUT CONTENT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                        {/* about */}
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Info size={16} style={{ color: activeTheme.primary }} />
                                <h2 className="text-xl font-bold" style={{ color: activeTheme.textDim }}>about</h2>
                            </div>
                            <p className="text-sm opacity-60 leading-relaxed" style={{ color: activeTheme.text }}>
                                typeflow is a minimalistic, customizable typing website, providing each user with a highly adjustable and pleasant experience.
                            </p>
                        </section>

                        {/* word set */}
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <AlignLeft size={16} style={{ color: activeTheme.primary }} />
                                <h2 className="text-xl font-bold" style={{ color: activeTheme.textDim }}>word set</h2>
                            </div>
                            <p className="text-sm opacity-60 leading-relaxed" style={{ color: activeTheme.text }}>
                                by default, this website uses the most common 200 english words. you can change this in the settings or the navigation bar to use expanded word sets, or even other languages.
                            </p>
                        </section>

                        {/* keybinds */}
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Keyboard size={16} style={{ color: activeTheme.primary }} />
                                <h2 className="text-xl font-bold" style={{ color: activeTheme.textDim }}>keybinds</h2>
                            </div>
                            <div className="flex flex-col gap-3">
                                <ShortcutRow keys={["tab"]} plus={["enter"]} desc="restart test" theme={activeTheme} />
                                <ShortcutRow keys={["esc"]} desc="command line" theme={activeTheme} />
                                <ShortcutRow keys={["ctrl", "shift", "p"]} desc="command line" theme={activeTheme} />
                            </div>
                        </section>

                        {/* results screen */}
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={16} style={{ color: activeTheme.primary }} />
                                <h2 className="text-xl font-bold" style={{ color: activeTheme.textDim }}>results screen</h2>
                            </div>
                            <p className="text-sm opacity-60 leading-relaxed" style={{ color: activeTheme.text }}>
                                after completing a test, you are presented with a lot of data, including wpm, accuracy, consistency, and a chart showing your performance during the test.
                            </p>
                        </section>

                        {/* support */}
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Heart size={16} style={{ color: activeTheme.primary }} />
                                <h2 className="text-xl font-bold" style={{ color: activeTheme.textDim }}>support</h2>
                            </div>
                            <p className="text-sm opacity-60 leading-relaxed" style={{ color: activeTheme.text }}>
                                if you enjoy this project and would like to support its continued development, please consider donating.
                            </p>
                            <div className="mt-2">
                                <ExternLink href="https://ko-fi.com/" icon={Heart} label="donate" theme={activeTheme} full />
                            </div>
                        </section>

                        {/* contact */}
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Mail size={16} style={{ color: activeTheme.primary }} />
                                <h2 className="text-xl font-bold" style={{ color: activeTheme.textDim }}>contact</h2>
                            </div>
                            <p className="text-sm opacity-60 leading-relaxed" style={{ color: activeTheme.text }}>
                                join the discord server, send an email, or create an issue on github.
                            </p>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <ExternLink href="https://discord.gg/typeflow" icon={MessageSquare} label="discord" theme={activeTheme} />
                                <ExternLink href="mailto:support@typeflow.com" icon={Mail} label="email" theme={activeTheme} />
                                <ExternLink href="https://github.com/earhengleap/typing" icon={Github} label="github" theme={activeTheme} />
                            </div>
                        </section>
                    </div>
                </motion.div>
            </main>
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
    let unit = "";

    if (loaded) {
        if (isTime) {
            const days = value / (3600 * 24);
            displayValue = days.toFixed(2);
            unit = "days";
        } else {
            if (value >= 1000000) {
                displayValue = (value / 1000000).toFixed(2);
                unit = "million";
            } else if (value >= 1000) {
                displayValue = (value / 1000).toFixed(2);
                unit = "thousand";
            } else {
                displayValue = value.toString();
            }
        }
    }

    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-bold opacity-40 mb-2 tracking-widest uppercase" style={{ color: theme.textDim }}>{label}</span>
            <div className="flex items-baseline gap-2">
                {loaded ? (
                    <>
                        <span className="text-5xl font-black transition-all" style={{ color: theme.primary }}>
                            {displayValue}
                        </span>
                        <span className="text-xs font-bold opacity-40" style={{ color: theme.textDim }}>{unit}</span>
                    </>
                ) : (
                    <div className="w-24 h-10 animate-pulse bg-white/5 rounded" />
                )}
            </div>
        </div>
    );
}

function ExternLink({ href, icon: Icon, label, theme, full }: { href: string, icon: any, label: string, theme: any, full?: boolean }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 group font-bold text-sm",
                full ? "w-full" : "flex-1"
            )}
            style={{ 
                backgroundColor: theme.bgAlt,
                color: theme.textDim 
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = theme.primary;
                e.currentTarget.style.color = theme.bg;
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = theme.bgAlt;
                e.currentTarget.style.color = theme.textDim;
            }}
        >
            <Icon size={16} className="transition-transform group-hover:scale-110" />
            <span>{label}</span>
        </a>
    );
}

function ShortcutRow({ keys, desc, theme, plus }: { keys: string[], desc: string, theme: any, plus?: string[] }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 min-w-[120px]">
                {keys.map((k, i) => (
                    <React.Fragment key={k}>
                        <kbd
                            className="px-2 py-0.5 rounded text-[10px] font-bold shadow-sm lowercase bg-current bg-opacity-10"
                            style={{ color: theme.text }}
                        >
                            {k}
                        </kbd>
                        {i < keys.length - 1 && <span className="text-[10px] opacity-20">+</span>}
                    </React.Fragment>
                ))}
            </div>
            <span className="text-xs opacity-40 font-bold" style={{ color: theme.textDim }}>{desc}</span>
        </div>
    );
}


