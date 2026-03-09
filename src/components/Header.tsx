"use client";

import React from "react";
import { motion } from "framer-motion";
import { Type, Trophy, Settings } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { SettingsModal } from "@/components/SettingsModal";
import { useState } from "react";
import Link from "next/link";
import { THEMES } from "@/constants/themes";

interface HeaderProps {
    activeTheme: typeof THEMES.codex;
}

export function Header({ activeTheme }: HeaderProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <header className="relative w-full max-w-5xl mx-auto flex items-center pt-4 pb-2 z-10 px-4 md:px-0 mb-4">
                <div className="flex w-full items-center">
                    <Link href="/" className="flex items-center gap-2 group flex-1">
                        <Type className="w-8 h-8 transition-transform group-hover:scale-110" style={{ color: activeTheme.primary }} />
                        <h1 className="text-[32px] tracking-tight font-bold ml-1 relative" style={{ color: activeTheme.textDim }}>
                            <span style={{ color: activeTheme.text }}>type</span>flow
                        </h1>
                    </Link>

                    <div className="flex-1" suppressHydrationWarning />

                    <div className="flex items-center gap-1 sm:gap-2 justify-end flex-1 z-20">
                        <Link href="/leaderboards">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-xl transition-all hover:bg-white/5 group"
                                type="button"
                                style={{ color: activeTheme.textDim }}
                            >
                                <Trophy className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: activeTheme.text }} />
                            </motion.button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-xl transition-all hover:bg-white/5 group"
                            type="button"
                            style={{ color: activeTheme.textDim }}
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <Settings className="w-6 h-6 group-hover:rotate-45 transition-transform" style={{ color: activeTheme.text }} />
                        </motion.button>
                        <UserMenu />
                    </div>
                </div>
                <SettingsModal isOpen={isSettingsOpen} onCloseAction={() => setIsSettingsOpen(false)} />
            </header>
        </>
    );
}
