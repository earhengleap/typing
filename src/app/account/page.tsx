"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { THEMES } from "@/constants/themes";
import { useMonkeyTypeStore, RunHistory } from "@/hooks/use-monkeytype-store";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { getUserTypingHistory, updateAccount, getUserAchievements } from "@/app/actions/typing-results";
import { ACHIEVEMENTS, Achievement } from "@/constants/achievements";
import {
    Calendar,
    Zap,
    Trophy,
    Clock,
    CheckCircle2,
    PlayCircle,
    Edit2,
    Check,
    X,
    User,
    Keyboard as KeyboardIcon,
    Award,
    Link as LinkIcon
} from "lucide-react";

interface UserData {
    level?: number;
    xp?: number;
    typingTime?: number;
    streak?: number;
    bio?: string | null;
    keyboard?: string | null;
    testsStarted?: number;
    testsCompleted?: number;
    achievements?: string[];
    joinedAt?: string | Date | null;
    [key: string]: any;
}

export default function AccountPage() {
    const { data: session } = useSession();
    const theme = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[theme] || THEMES.codex;

    const [history, setHistory] = useState<RunHistory[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [achievements, setAchievements] = useState<{ achievementId: string; unlockedAt: string | Date }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Editing state
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioValue, setBioValue] = useState("");
    const [isEditingKeyboard, setIsEditingKeyboard] = useState(false);
    const [keyboardValue, setKeyboardValue] = useState("");
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    useEffect(() => {
        if (session?.user?.id) {
            getUserTypingHistory(session.user.id).then((res) => {
                if (res.success) {
                    setHistory(res.data || []);
                    setUserData(res.user || null);
                    setBioValue(res.user?.bio || "");
                    setKeyboardValue(res.user?.keyboard || "");
                }
            });
            getUserAchievements(session.user.id).then((res) => {
                if (res.success) {
                    setAchievements(res.data || []);
                }
                setIsLoading(false);
            });
        }
    }, [session?.user?.id]);

    const handleSaveBio = async () => {
        const res = await updateAccount({ bio: bioValue });
        if (res.success) {
            setUserData({ ...userData, bio: bioValue });
            setIsEditingBio(false);
        }
    };

    const handleSaveKeyboard = async () => {
        const res = await updateAccount({ keyboard: keyboardValue });
        if (res.success) {
            setUserData({ ...userData, keyboard: keyboardValue });
            setIsEditingKeyboard(false);
        }
    };

    const timePlaying = useMemo(() => {
        if (!userData?.typingTime) return "0s";
        const totalSeconds = userData.typingTime;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }, [userData]);

    const xpProgress = useMemo(() => {
        if (!userData?.xp) return { current: 0, target: 50, percent: 0, remaining: 50 };
        const currentLevel = userData.level || 1;
        const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 50;
        const xpForNextLevel = Math.pow(currentLevel, 2) * 50;
        const currentProgress = userData.xp - xpForCurrentLevel;
        const targetXp = xpForNextLevel - xpForCurrentLevel;
        const percent = Math.min(Math.round((currentProgress / targetXp) * 100), 100);
        return {
            current: currentProgress,
            target: targetXp,
            percent,
            remaining: targetXp - currentProgress
        };
    }, [userData]);

    const joinDate = useMemo(() => {
        if (!userData?.joinedAt) return "Long ago";
        return new Date(userData.joinedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }, [userData]);

    // Simplified Heatmap Data
    const heatmapData = useMemo(() => {
        const days = 14 * 7; // 14 weeks
        const data = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            const count = history.filter(h => new Date(h.date).toDateString() === date.toDateString()).length;
            return { date, count };
        });
        return data;
    }, [history]);

    // Stats by config
    const configBests = useMemo(() => {
        const configs = [
            { mode: "time", config: 15 },
            { mode: "time", config: 30 },
            { mode: "time", config: 60 },
            { mode: "time", config: 120 },
            { mode: "words", config: 10 },
            { mode: "words", config: 25 },
            { mode: "words", config: 50 },
            { mode: "words", config: 100 },
        ];

        const languages: ("english" | "khmer")[] = ["english", "khmer"];
        const results: { mode: string; config: number; language: string; best: number | string }[] = [];

        languages.forEach(lang => {
            configs.forEach(c => {
                const matches = history.filter(h => h.mode === c.mode && h.config === c.config && h.language === lang);
                const best = matches.length > 0 ? Math.max(...matches.map(m => m.wpm)) : "-";
                if (best !== "-") {
                    results.push({ ...c, language: lang, best });
                }
            });
        });

        // If no language specific bests yet, show default English placeholders
        if (results.length === 0) {
            return configs.map(c => ({ ...c, language: "english", best: "-" }));
        }

        return results;
    }, [history]);

    if (isLoading) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: activeTheme.bg }}>
                <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${activeTheme.primary}40`, borderTopColor: activeTheme.primary }} />
                <p style={{ color: activeTheme.textDim }}>Loading profile...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen transition-colors duration-300 pb-20 scroll-smooth selection:bg-[var(--mt-primary-20)]" style={{ backgroundColor: activeTheme.bg }}>
            <Header activeTheme={activeTheme} />
            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-12">

                {/* Profile Header */}
                <section className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group shrink-0">
                        {session?.user?.image ? (
                            <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4" style={{ borderColor: activeTheme.bgAlt }}>
                                <Image src={session.user.image} alt="Avatar" fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-32 h-32 rounded-3xl flex items-center justify-center border-4 border-dashed" style={{ borderColor: activeTheme.bgAlt, color: activeTheme.textDim }}>
                                <User size={48} />
                            </div>
                        )}
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-xl border-2" style={{ backgroundColor: activeTheme.bgAlt, borderColor: activeTheme.bg, color: activeTheme.primary }}>
                            <span className="text-[10px] uppercase font-bold leading-none opacity-60">Lvl</span>
                            <span className="text-lg font-black leading-none">{userData?.level || 1}</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-4xl font-black tracking-tight" style={{ color: activeTheme.text }}>{session?.user?.name}</h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium" style={{ color: activeTheme.textDim }}>
                                <div className="flex items-center gap-1.5"><Calendar size={14} /> Joined {joinDate}</div>
                                <div className="flex items-center gap-1.5" style={{ color: activeTheme.primary }}><Zap size={14} fill="currentColor" /> {userData?.streak || 0} day streak</div>
                            </div>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="flex flex-col gap-1.5 max-w-xs group/xp">
                            <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: activeTheme.textDim }}>
                                <span>Level {userData?.level || 1}</span>
                                <span>{xpProgress.percent}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full overflow-hidden relative" style={{ backgroundColor: activeTheme.bgAlt }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpProgress.percent}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: activeTheme.primary }}
                                />
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/xp:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[9px] font-bold opacity-0 group-hover/xp:opacity-40 transition-all transform translate-y-1 group-hover/xp:translate-y-0" style={{ color: activeTheme.textDim }}>
                                {xpProgress.remaining} XP until level {(userData?.level || 1) + 1}
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div className="max-w-xl group relative pr-8">
                            {isEditingBio ? (
                                <div className="flex flex-col gap-2">
                                    <textarea
                                        autoFocus
                                        value={bioValue}
                                        onChange={(e) => setBioValue(e.target.value)}
                                        className="w-full bg-transparent border-b-2 outline-none py-1 text-sm resize-none"
                                        style={{ borderColor: activeTheme.primary, color: activeTheme.text }}
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveBio} className="p-1 px-3 rounded bg-white/5 hover:bg-white/10 text-xs font-bold transition-all" style={{ color: activeTheme.primary }}><Check size={14} /></button>
                                        <button onClick={() => { setIsEditingBio(false); setBioValue(userData?.bio || ""); }} className="p-1 px-3 rounded bg-white/5 hover:bg-white/10 text-xs font-bold transition-all" style={{ color: activeTheme.error }}><X size={14} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <p className="text-sm italic leading-relaxed" style={{ color: activeTheme.textDim }}>
                                        {userData?.bio || "No bio yet. Click edit to add one."}
                                    </p>
                                    <button
                                        onClick={() => setIsEditingBio(true)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/5"
                                        style={{ color: activeTheme.primary }}
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Keyboard Section */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: activeTheme.bgAlt, color: activeTheme.textDim }}>
                                <KeyboardIcon size={14} />
                                {isEditingKeyboard ? (
                                    <input
                                        autoFocus
                                        value={keyboardValue}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyboardValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveKeyboard()}
                                        className="bg-transparent border-none outline-none w-32"
                                        style={{ color: activeTheme.text }}
                                    />
                                ) : (
                                    <span className="truncate max-w-[150px]">{userData?.keyboard || "No keyboard set"}</span>
                                )}
                                <button onClick={() => isEditingKeyboard ? handleSaveKeyboard() : setIsEditingKeyboard(true)} style={{ color: activeTheme.primary }}>
                                    {isEditingKeyboard ? <Check size={14} /> : <Edit2 size={12} />}
                                </button>
                            </div>
                            {userData?.keyboard && !isEditingKeyboard && (
                                <div className="p-1.5 rounded-full hover:bg-white/5" style={{ color: activeTheme.primary }}>
                                    <LinkIcon size={14} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 w-full md:w-64">
                        {[
                            { label: "Tests Started", value: userData?.testsStarted || 0, icon: PlayCircle },
                            { label: "Tests Completed", value: userData?.testsCompleted || 0, icon: CheckCircle2 },
                            { label: "Time Typing", value: timePlaying, icon: Clock },
                            { label: "Achievements", value: (userData?.achievements as string[] || []).length, icon: Award },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-2xl flex items-center gap-4 border" style={{ backgroundColor: activeTheme.bgAlt + "30", borderColor: activeTheme.bgAlt }}>
                                <div className="p-2.5 rounded-xl" style={{ backgroundColor: activeTheme.bgAlt, color: activeTheme.primary }}>
                                    <stat.icon size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-40" style={{ color: activeTheme.textDim }}>{stat.label}</span>
                                    <span className="text-xl font-black" style={{ color: activeTheme.text }}>{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Heatmap Section */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: activeTheme.textDim }}>
                            <Calendar size={14} className="opacity-50" />
                            Activity
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: activeTheme.textDim }}>
                            Less <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: activeTheme.bgAlt }} />
                            <div className="w-2.5 h-2.5 rounded-sm opacity-40" style={{ backgroundColor: activeTheme.primary }} />
                            <div className="w-2.5 h-2.5 rounded-sm opacity-70" style={{ backgroundColor: activeTheme.primary }} />
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: activeTheme.primary }} /> More
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] border overflow-x-auto scrollbar-hide theme-transition" style={{ backgroundColor: activeTheme.bgAlt + "15", borderColor: activeTheme.bgAlt }}>
                        <div className="flex gap-2 min-w-max justify-center">
                            {Array.from({ length: 14 }).map((_, weekIdx) => (
                                <div key={weekIdx} className="flex flex-col gap-2">
                                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                                        const data = heatmapData[weekIdx * 7 + dayIdx];
                                        const intensity = data.count === 0 ? 0 : data.count > 5 ? 4 : data.count > 3 ? 3 : data.count > 1 ? 2 : 1;
                                        return (
                                            <div
                                                key={dayIdx}
                                                className="w-4 h-4 rounded-sm transition-all hover:scale-125 cursor-help relative group/cell"
                                                style={{
                                                    backgroundColor: intensity === 0 ? activeTheme.bgAlt : activeTheme.primary,
                                                    opacity: intensity === 0 ? 0.3 : intensity === 1 ? 0.4 : intensity === 2 ? 0.6 : intensity === 3 ? 0.8 : 1
                                                }}
                                            >
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-xl bg-[#000] text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-all scale-95 group-hover/cell:scale-100 z-10 shadow-2xl border border-white/10">
                                                    {data.count} tests on {data.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-12">
                    {/* Achievements Section */}
                    <section className="flex flex-col gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: activeTheme.textDim }}>
                            <Award size={14} className="opacity-50" />
                            Achievements
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                            {Object.values(ACHIEVEMENTS).map((achievement) => {
                                const isUnlocked = (userData?.achievements as string[] || []).includes(achievement.id);
                                const AchievementIcon = achievement.icon;
                                return (
                                    <div
                                        key={achievement.id}
                                        className="relative group/ach p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all"
                                        style={{
                                            backgroundColor: isUnlocked ? `${achievement.color}10` : activeTheme.bgAlt + "10",
                                            borderColor: isUnlocked ? `${achievement.color}40` : activeTheme.bgAlt,
                                            filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.5)'
                                        }}
                                        onClick={() => isUnlocked && setSelectedAchievement(achievement)}
                                    >
                                        <div className="p-3 rounded-xl" style={{ backgroundColor: isUnlocked ? `${achievement.color}20` : activeTheme.bgAlt, color: isUnlocked ? achievement.color : activeTheme.textDim }}>
                                            <AchievementIcon size={24} />
                                        </div>
                                        <span className="text-[10px] font-black text-center line-clamp-1" style={{ color: isUnlocked ? activeTheme.text : activeTheme.textDim }}>{achievement.name}</span>

                                        {/* Achievement Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 rounded-xl bg-[#000] text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover/ach:opacity-100 pointer-events-none transition-all scale-95 group-hover/ach:scale-100 z-20 shadow-2xl border border-white/10 w-48 text-center leading-relaxed">
                                            <div style={{ color: achievement.color }}>{achievement.name}</div>
                                            <div className="opacity-70 mt-1 font-medium">{achievement.description}</div>
                                            {!isUnlocked && <div className="mt-2 pt-2 border-t border-white/10 opacity-50 font-normal italic uppercase tracking-widest">Locked</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Bests Grid */}
                    <section className="flex flex-col gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: activeTheme.textDim }}>
                            <Trophy size={14} className="opacity-50" />
                            Personal Bests
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {configBests.map((c, i) => (
                                <div key={i} className="p-5 rounded-2xl border flex items-center justify-between group transition-all hover:border-[var(--mt-primary-30)]" style={{ backgroundColor: activeTheme.bgAlt + "20", borderColor: activeTheme.bgAlt }}>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider" style={{ color: activeTheme.textDim }}>{c.language} {c.mode}</span>
                                        <span className="text-sm font-black" style={{ color: activeTheme.text }}>{c.config} {c.mode === 'time' ? 's' : 'words'}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl font-black group-hover:scale-110 transition-transform" style={{ color: c.best === '-' ? activeTheme.textDim : activeTheme.primary }}>{c.best}</span>
                                        {c.best !== '-' && <span className="text-[10px] font-bold opacity-30 uppercase" style={{ color: activeTheme.textDim }}>wpm</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* All-time Leaderboards (Mock for now) */}
                    <section className="flex flex-col gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: activeTheme.textDim }}>
                            <Trophy size={14} className="opacity-50" />
                            Recent Global Standings
                        </div>

                        <div className="flex flex-col gap-4">
                            {[15, 60].map((t) => (
                                <div key={t} className="p-6 rounded-3xl border flex flex-col gap-4" style={{ backgroundColor: activeTheme.bgAlt + "20", borderColor: activeTheme.bgAlt } as React.CSSProperties}>
                                    <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: activeTheme.bgAlt }}>
                                        <span className="text-xl font-black" style={{ color: activeTheme.text }}>{t} seconds</span>
                                        <span className="text-xs font-bold opacity-50 uppercase tracking-widest" style={{ color: activeTheme.textDim }}>Global Rank #---</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-xs font-bold opacity-40 uppercase tracking-widest" style={{ color: activeTheme.textDim }}>
                                            <span>Rank</span>
                                            <span>User</span>
                                            <span>WPM</span>
                                        </div>
                                        <div className="flex items-center justify-center py-8 text-xs italic font-medium opacity-30" style={{ color: activeTheme.textDim }}>
                                            Complete a public test to see your global standing
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

            </div>
        </main>
    );
}
