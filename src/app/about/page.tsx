"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthenticInfo } from "@/components/icons/AuthenticInfo";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import Link from "next/link";
import { motion } from "framer-motion";
import { HandHeart } from "lucide-react";
import { AuthenticMail } from "@/components/icons/AuthenticMail";
import { AuthenticGithub } from "@/components/icons/AuthenticGithub";
import { AuthenticDiscord } from "@/components/icons/AuthenticDiscord";
import { AuthenticSupport } from "@/components/icons/AuthenticSupport";
import { getGlobalStats, getActivityGraph } from "@/app/actions/global-stats";

export default function AboutPage() {
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const [mounted, setMounted] = useState(false);
    const [globalStats, setGlobalStats] = useState({ testsStarted: 0, testsCompleted: 0, typingTime: 0 });
    const [graphData, setGraphData] = useState<number[]>([]);
    const [statsLoaded, setStatsLoaded] = useState(false);

    useEffect(() => {
        setMounted(true);
        Promise.all([getGlobalStats(), getActivityGraph()]).then(([stats, graph]) => {
            setGlobalStats(stats);
            setGraphData(graph);
            setStatsLoaded(true);
        });
    }, []);

    if (!mounted) return null;

    return (
        <div
            className="min-h-screen flex flex-col font-mono selection:bg-white/20 transition-colors duration-500 pt-1 sm:pt-1.5 md:pt-3 px-[var(--content-px)]"
            style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}
        >
            <Header activeTheme={activeTheme} />

            <main className="flex-1 w-full mx-auto flex flex-col py-8 overflow-y-auto overflow-x-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-[800px] flex flex-col gap-10 sm:gap-14 leading-relaxed"
                >
                    {/* ABOUT */}
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <AuthenticInfo className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: activeTheme.primary }} />
                            <h2 className="text-xl sm:text-2xl font-black" style={{ color: activeTheme.textDim }}>about</h2>
                        </div>
                        <p className="text-sm sm:text-base opacity-80">
                            <span style={{ color: activeTheme.text }}>type</span>flow is a minimalistic, customizable typing website. Test yourself in various modes, track your progress and improve your speed.
                        </p>
                    </section>

                    {/* BUG REPORT OR FEATURE REQUEST */}
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <BugIcon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: activeTheme.primary }} />
                            <h2 className="text-xl sm:text-2xl font-black" style={{ color: activeTheme.textDim }}>bug report or feature request</h2>
                        </div>
                        <p className="text-sm sm:text-base opacity-80">
                            If you encounter a bug, or have a feature request - join the Discord server, send me an email, or create an issue on GitHub.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-1">
                            <ExternLink href="https://discord.gg/typeflow" icon={AuthenticDiscord} label="Discord" theme={activeTheme} />
                            <ExternLink href="mailto:support@typeflow.com" icon={AuthenticMail} label="Email" theme={activeTheme} />
                            <ExternLink href="https://github.com/earhengleap/typing/issues" icon={AuthenticGithub} label="GitHub" theme={activeTheme} />
                        </div>
                    </section>

                    {/* SUPPORT */}
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <AuthenticSupport className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: activeTheme.primary }} />
                            <h2 className="text-xl sm:text-2xl font-black" style={{ color: activeTheme.textDim }}>support</h2>
                        </div>
                        <p className="text-sm sm:text-base opacity-80">
                            If you enjoy this project and would like to support its continued development, please consider donating.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-1">
                            <ExternLink href="https://ko-fi.com/" icon={HandHeart} label="Donate" theme={activeTheme} />
                        </div>
                    </section>

                    {/* STATS */}
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: activeTheme.primary }} />
                            <h2 className="text-xl sm:text-2xl font-black" style={{ color: activeTheme.textDim }}>stats</h2>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-6 md:gap-12 mt-2">
                            <div className="flex flex-col gap-0.5" style={{ opacity: statsLoaded ? 1 : 0.5 }}>
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: activeTheme.textDim }}>tests started</span>
                                <span className="text-2xl sm:text-3xl font-black" style={{ color: activeTheme.text }}>
                                    {statsLoaded ? globalStats.testsStarted.toLocaleString() : "..."}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5" style={{ opacity: statsLoaded ? 1 : 0.5 }}>
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: activeTheme.textDim }}>tests completed</span>
                                <span className="text-2xl sm:text-3xl font-black" style={{ color: activeTheme.text }}>
                                    {statsLoaded ? globalStats.testsCompleted.toLocaleString() : "..."}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5" style={{ opacity: statsLoaded ? 1 : 0.5 }}>
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: activeTheme.textDim }}>typing time</span>
                                <span className="text-2xl sm:text-3xl font-black" style={{ color: activeTheme.text }}>
                                    {statsLoaded ? formatTypingTime(globalStats.typingTime) : "..."}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col mt-6 bg-black/5 rounded-xl p-4 sm:p-6" style={{ backgroundColor: `${activeTheme.textDim}08` }}>
                            <span className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50" style={{ color: activeTheme.textDim }}>Activity (Last 30 Days)</span>
                            {statsLoaded ? (
                                <GlobalActivityGraph theme={activeTheme} data={graphData} />
                            ) : (
                                <div className="h-32 sm:h-40 w-full animate-pulse rounded opacity-20" style={{ backgroundColor: activeTheme.textDim }} />
                            )}
                        </div>
                    </section>

                    {/* SHORTCUTS */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <KeyboardShortcutIcon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: activeTheme.primary }} />
                            <h2 className="text-xl sm:text-2xl font-black" style={{ color: activeTheme.textDim }}>shortcuts</h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            <ShortcutRow keys={["tab"]} plus={["enter"]} desc="restart test" theme={activeTheme} />
                            <ShortcutRow keys={["esc"]} desc="command line" theme={activeTheme} />
                            <ShortcutRow keys={["ctrl", "shift", "p"]} desc="command line" theme={activeTheme} />
                        </div>
                    </section>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}

// -------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------

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

function formatTypingTime(seconds: number) {
    if (seconds === 0) return "0s";
    const y = Math.floor(seconds / (3600 * 24 * 365.25));
    seconds %= (3600 * 24 * 365.25);
    const d = Math.floor(seconds / (3600 * 24));
    seconds %= (3600 * 24);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (y > 0) parts.push(`${y}y`);
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(h.toString().padStart(2, '0') + 'h');
    if (y === 0 && d === 0 && h === 0 && m > 0) parts.push(m.toString().padStart(2, '0') + 'm');
    
    return parts.join(" ") || "0s";
}

function GlobalActivityGraph({ theme, data }: { theme: any, data: number[] }) {
    const max = Math.max(...data, 1);

    return (
        <div className="w-full flex items-end gap-[1px] h-32 sm:h-40">
            {data.map((val, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${(val / max) * 100}%`, opacity: 0.8 }}
                    transition={{ delay: i * 0.02, duration: 0.5, ease: "easeOut" }}
                    className="flex-1 rounded-t-[2px] transition-all duration-300 hover:opacity-100 cursor-crosshair relative group"
                    style={{ backgroundColor: theme.primary }}
                >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-10"
                         style={{ backgroundColor: theme.text, color: theme.bg }}>
                        Day {i + 1}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// Minimal SVGs for headers
function InfoIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
}
function BugIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 2h8"/><path d="M12 2v4"/><path d="M14 6v2"/><path d="M10 6v2"/><path d="M2.5 12a9.5 9.5 0 0 1 19 0"/><path d="M22 17a10 10 0 0 1-20 0"/><path d="M15 10v2"/><path d="M9 10v2"/><path d="M12 14v6"/></svg>; // Abstract bug representation matching standard lucide
}
function HeartIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
}
function ChartBarIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function KeyboardShortcutIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/></svg>;
}
