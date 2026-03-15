"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getTopLeaderboard } from "@/app/actions/leaderboard";
import { Trophy, Medal, User, Award, X, Clock, Calendar, Globe, List, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface LeaderboardEntry {
    userId: string;
    name: string;
    image?: string;
    level?: number;
    wpm: number;
    accuracy: number;
    rawWpm: number;
    consistency?: number;
    missedChars?: number;
    duration?: number;
    date: string;
}

interface ThemeColors {
    bg: string;
    bgAlt: string;
    text: string;
    textDim: string;
    primary: string;
    error: string;
    primaryRgb: string;
}

interface LeaderboardProps {
    theme: ThemeColors;
    isOpen?: boolean;
    onClose?: () => void;
    isModal?: boolean;
    initialType?: "allTime" | "weekly" | "daily";
    initialMode?: "time" | "words";
    initialConfig?: string;
    initialLanguage?: "english" | "khmer";
}

export function Leaderboard({
    theme,
    isOpen = true,
    onClose,
    isModal = true,
    initialType = "allTime",
    initialMode = "time",
    initialConfig = "15",
    initialLanguage = "english"
}: LeaderboardProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");

    // Countdown logic
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const resetType = (searchParams.get("type") as "allTime" | "weekly" | "daily") || initialType;

            const targetDate = new Date();
            if (resetType === "allTime") {
                // For allTime, show a recurring 1-hour sync countdown to feel "live"
                targetDate.setUTCHours(now.getUTCHours() + 1, 0, 0, 0);
            } else if (resetType === "daily") {
                targetDate.setUTCHours(24, 0, 0, 0);
            } else if (resetType === "weekly") {
                // Next Monday 00:00 UTC
                const day = targetDate.getUTCDay();
                const diff = (day === 0 ? 1 : 8 - day);
                targetDate.setUTCDate(targetDate.getUTCDate() + diff);
                targetDate.setUTCHours(0, 0, 0, 0);
            }

            const diffMs = targetDate.getTime() - now.getTime();
            if (diffMs <= 0) {
                setTimeLeft("Resetting...");
                return;
            }

            const hours = Math.floor((diffMs / (1000 * 60 * 60)));
            const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
            const seconds = Math.floor((diffMs / 1000) % 60);

            if (hours >= 24) {
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                setTimeLeft(`${days}d ${String(remainingHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            } else {
                setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();
        return () => clearInterval(timer);
    }, [initialType, searchParams]);

    const activeMode = (searchParams.get("mode") as "time" | "words") || initialMode;
    const activeConfig = searchParams.get("config") || (activeMode === "words" ? "25" : "15");
    const activeTab = (searchParams.get("type") as "allTime" | "weekly" | "daily") || initialType;
    const activeLanguage = (searchParams.get("lang") as "english" | "khmer") || initialLanguage;

    useEffect(() => {
        if (!isOpen) return;

        const fetchLeaderboard = async () => {
            setLoading(true);
            const data = await getTopLeaderboard(50, activeTab, activeMode, activeConfig, activeLanguage);
            setEntries(data as LeaderboardEntry[]);
            setLoading(false);
        };

        fetchLeaderboard();
    }, [isOpen, activeTab, activeMode, activeConfig, activeLanguage]);

    const updateQueryParams = (type: string, mode: string, config: string, lang: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", type);
        params.set("mode", mode);
        params.set("config", config);
        params.set("lang", lang);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        if (!isModal) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && onClose) onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose, isModal]);

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return {
                date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            };
        } catch {
            return { date: 'Unknown', time: '' };
        }
    };

    const Content = (
        <div
            className={cn(
                "relative bg-[#2c2e31] overflow-hidden flex flex-col transition-all duration-300",
                isModal ? "w-full h-full max-w-6xl md:h-auto md:max-h-[85vh] rounded-none md:rounded-3xl shadow-2xl border border-white/5" : "w-full max-w-5xl mx-auto rounded-none md:rounded-3xl border border-white/5"
            )}
            style={{ backgroundColor: theme.bg }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header/Title */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: theme.text }}>
                        {activeTab === 'allTime' ? 'All-time' : activeTab === 'weekly' ? 'Weekly' : 'Daily'} {activeLanguage === 'english' ? 'English' : 'Khmer'} {activeMode} {activeConfig} Leaderboard
                    </h1>
                    {timeLeft && (
                        <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-[0.1em] opacity-50" style={{ color: theme.textDim }}>
                            <span>Next update in</span>
                            <span className="font-mono text-sm" style={{ color: theme.primary }}>{timeLeft}</span>
                        </div>
                    )}
                </div>
                {isModal && onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl transition-all hover:bg-white/5 opacity-50 hover:opacity-100"
                        style={{ color: theme.textDim }}
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden min-h-[600px]">
                {/* Sidebar */}
                <div className="w-14 sm:w-20 md:w-64 border-r border-white/5 p-2 md:p-4 flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <h3 className="hidden md:block text-[10px] uppercase tracking-[0.2em] font-black opacity-20 px-4">Language</h3>
                        <div className="flex flex-col gap-1">
                            {[
                                { id: 'english', label: 'english', icon: Globe },
                                { id: 'khmer', label: 'khmer', icon: Globe },
                            ].map(lang => (
                                <button
                                    key={lang.id}
                                    onClick={() => updateQueryParams(activeTab, activeMode, activeConfig, lang.id)}
                                    className={cn(
                                        "flex items-center justify-center md:justify-start gap-3 p-2 md:p-3 rounded-xl transition-all",
                                        activeLanguage === lang.id ? "bg-[#e2b714]" : "hover:bg-white/5"
                                    )}
                                    style={{
                                        backgroundColor: activeLanguage === lang.id ? theme.primary : undefined,
                                        color: activeLanguage === lang.id ? theme.bg : theme.textDim
                                    }}
                                >
                                    <lang.icon className="w-5 h-5 shrink-0" />
                                    <span className="hidden md:block font-bold text-sm tracking-tight">{lang.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="hidden md:block text-[10px] uppercase tracking-[0.2em] font-black opacity-20 px-4">Category</h3>
                        <div className="flex flex-col gap-1">
                            {[
                                { id: 'allTime', label: 'all-time', icon: Globe },
                                { id: 'weekly', label: 'weekly xp', icon: Award },
                                { id: 'daily', label: 'daily', icon: Calendar },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => updateQueryParams(tab.id, activeMode, activeConfig, activeLanguage)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl transition-all group",
                                        activeTab === tab.id ? "bg-[#e2b714]" : "hover:bg-white/5"
                                    )}
                                    style={{
                                        backgroundColor: activeTab === tab.id ? theme.primary : undefined,
                                        color: activeTab === tab.id ? theme.bg : theme.textDim
                                    }}
                                >
                                    <tab.icon className="w-5 h-5 shrink-0" />
                                    <span className="hidden md:block font-bold text-sm tracking-tight">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="hidden md:block text-[10px] uppercase tracking-[0.2em] font-black opacity-20 px-4">Mode</h3>
                        <div className="flex flex-col gap-1">
                            {[
                                { id: 'time', label: 'time', icon: Clock },
                                { id: 'words', label: 'words', icon: Type },
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        const nextConfig = m.id === 'time' ? '15' : '25';
                                        updateQueryParams(activeTab, m.id, nextConfig, activeLanguage);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl transition-all",
                                        activeMode === m.id ? "bg-[#e2b714]" : "hover:bg-white/5"
                                    )}
                                    style={{
                                        backgroundColor: activeMode === m.id ? theme.primary : undefined,
                                        color: activeMode === m.id ? theme.bg : theme.textDim
                                    }}
                                >
                                    <m.icon className="w-5 h-5 shrink-0" />
                                    <span className="hidden md:block font-bold text-sm tracking-tight">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="hidden md:block text-[10px] uppercase tracking-[0.2em] font-black opacity-20 px-4">Config</h3>
                        <div className="flex flex-col gap-1">
                            {(activeMode === 'time' ? ['15', '30', '60', '120'] : ['10', '25', '50', '100']).map(conf => (
                                <button
                                    key={conf}
                                    onClick={() => updateQueryParams(activeTab, activeMode, conf, activeLanguage)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl transition-all",
                                        activeConfig === conf ? "bg-[#e2b714]" : "hover:bg-white/5"
                                    )}
                                    style={{
                                        backgroundColor: activeConfig === conf ? theme.primary : undefined,
                                        color: activeConfig === conf ? theme.bg : theme.textDim
                                    }}
                                >
                                    <List className="w-5 h-5 shrink-0" />
                                    <span className="hidden md:block font-bold text-sm tracking-tight">{conf}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-y-1">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-[0.2em] font-black opacity-20">
                                    <th className="px-4 py-2 w-12 text-center">#</th>
                                    <th className="px-4 py-2">name</th>
                                    <th className="px-4 py-2 text-right">wpm</th>
                                    <th className="px-4 py-2 text-right">acc</th>
                                    <th className="px-4 py-2 text-right hidden sm:table-cell">missed</th>
                                    <th className="px-4 py-2 text-right hidden sm:table-cell">consistency</th>
                                    <th className="px-4 py-2 text-right md:table-cell hidden">raw</th>
                                    {activeMode === "words" && <th className="px-4 py-2 text-right md:table-cell hidden">time</th>}
                                    <th className="px-4 py-2 text-right md:table-cell hidden">date</th>
                                </tr>
                            </thead>
                            <motion.tbody
                                initial="hidden"
                                animate="show"
                                variants={{
                                    show: {
                                        transition: {
                                            staggerChildren: 0.03
                                        }
                                    }
                                }}
                            >
                                {loading ? (
                                    Array(10).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={8} className="h-12 bg-white/5 rounded-xl border-y-[6px] border-transparent" />
                                        </tr>
                                    ))
                                ) : entries.length > 0 ? (
                                    entries.map((entry, index) => {
                                        const { date, time } = formatDate(entry.date);
                                        const isMe = session?.user?.id === entry.userId;

                                        return (
                                            <motion.tr
                                                key={entry.userId}
                                                variants={{
                                                    hidden: { opacity: 0, x: -10 },
                                                    show: { opacity: 1, x: 0 }
                                                }}
                                                className={cn(
                                                    "group transition-colors relative",
                                                    isMe ? "bg-white/[0.03]" : "hover:bg-white/5"
                                                )}
                                            >
                                                <td className="px-4 py-3 text-center rounded-l-2xl relative">
                                                    {isMe && (
                                                        <div
                                                            className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full"
                                                            style={{ backgroundColor: theme.primary }}
                                                        />
                                                    )}
                                                    {index === 0 ? (
                                                        <div className="flex justify-center">
                                                            <Trophy className="w-5 h-5" style={{ color: '#e2b714' }} />
                                                        </div>
                                                    ) : index === 1 ? (
                                                        <div className="flex justify-center">
                                                            <Medal className="w-5 h-5" style={{ color: '#d1d5db' }} />
                                                        </div>
                                                    ) : index === 2 ? (
                                                        <div className="flex justify-center">
                                                            <Medal className="w-5 h-5" style={{ color: '#9a3412' }} />
                                                        </div>
                                                    ) : (
                                                        <span className="font-mono text-sm opacity-30">{index + 1}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {entry.image ? (
                                                                <Image src={entry.image} alt={entry.name || "Avatar"} fill className="object-cover" />
                                                            ) : (
                                                                <User className="w-4 h-4 opacity-50" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold tracking-tight truncate max-w-[120px] md:max-w-none">{entry.name}</span>
                                                            <span className="text-[10px] opacity-30 font-black uppercase">Lvl {entry.level || 1}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-lg font-black italic tracking-tighter" style={{ color: index < 3 ? theme.primary : theme.text }}>
                                                        {(entry.wpm ?? 0).toFixed(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-bold tabular-nums">
                                                        {(entry.accuracy ?? 0).toFixed(0)}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right hidden sm:table-cell">
                                                    <span className="opacity-30 font-mono text-xs tabular-nums">
                                                        {entry.missedChars ?? 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right hidden sm:table-cell">
                                                    <span className="opacity-50 font-mono text-xs tabular-nums">
                                                        {entry.consistency ? `${entry.consistency.toFixed(0)}%` : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right md:table-cell hidden">
                                                    <span className="opacity-50 tabular-nums">{(entry.rawWpm ?? 0).toFixed(2)}</span>
                                                </td>
                                                {activeMode === "words" && (
                                                    <td className="px-4 py-3 text-right md:table-cell hidden">
                                                        <span className="opacity-50 tabular-nums">
                                                            {entry.duration ? `${Math.floor(entry.duration / 60)}:${String(entry.duration % 60).padStart(2, '0')}` : '-'}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-right rounded-r-2xl md:table-cell hidden">
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-[10px] font-bold">{date}</span>
                                                        <span className="text-[10px] opacity-30">{time}</span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center opacity-30 italic">
                                            No results yet. Be the first to join the leaderboard!
                                        </td>
                                    </tr>
                                )}
                            </motion.tbody>
                        </table>
                    </div>
                    <div className="px-8 py-4 bg-white/5 flex items-center justify-center">
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-20">
                            Real-time rankings powered by Upstash Redis
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!isModal) return Content;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="relative w-full h-full max-w-6xl md:h-auto md:max-h-[90vh]"
                    >
                        {Content}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
