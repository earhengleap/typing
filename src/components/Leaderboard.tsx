"use client";

import { useEffect, useState } from "react";
import { getTopLeaderboard } from "@/app/actions/leaderboard";
import { Trophy, Medal, User, Award } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardEntry {
    userId: string;
    name: string;
    wpm: number;
}

interface LeaderboardProps {
    theme: any;
}

export function Leaderboard({ theme }: LeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            const data = await getTopLeaderboard();
            setEntries(data);
            setLoading(false);
        };

        fetchLeaderboard();

        // Refresh every minute
        const interval = setInterval(fetchLeaderboard, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading && entries.length === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl flex flex-col items-center gap-4 opacity-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }}></div>
                <p className="text-sm font-bold tracking-widest uppercase">Loading Global Leaderboard...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 mt-12 mb-24">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6" style={{ color: theme.primary }} />
                    <h2 className="text-xl font-bold tracking-tight">global leaderboard</h2>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30">top 10 all-time wpm</div>
            </div>

            <div className="flex flex-col gap-1 rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: theme.bgAlt + '50' }}>
                {entries.length > 0 ? (
                    entries.map((entry, index) => (
                        <motion.div
                            key={`${entry.userId}-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/5"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-8 flex justify-end font-mono text-sm font-bold opacity-30">
                                    {index + 1}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: theme.bg }}>
                                        {index === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                                        {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                                        {index === 2 && <Medal className="w-4 h-4 text-amber-600" />}
                                        {index > 2 && <User className="w-4 h-4 opacity-30" />}
                                    </div>
                                    <span className="font-bold">{entry.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold" style={{ color: theme.primary }}>{entry.wpm}</span>
                                <span className="text-xs font-bold opacity-30 uppercase tracking-tighter">wpm</span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="p-12 text-center opacity-30 italic">
                        No results yet. Be the first to join the leaderboard!
                    </div>
                )}
            </div>
        </div>
    );
}
