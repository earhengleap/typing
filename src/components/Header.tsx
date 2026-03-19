"use client";

import React from "react";
import { motion } from "framer-motion";
import { Type, Bell } from "lucide-react";
import { AuthenticCrown } from "@/components/icons/AuthenticCrown";
import { AuthenticKeyboard } from "@/components/icons/AuthenticKeyboard";
import { AuthenticInfo } from "@/components/icons/AuthenticInfo";
import { AuthenticSettings } from "@/components/icons/AuthenticSettings";
import { AuthenticBell } from "@/components/icons/AuthenticBell";
import { UserMenu } from "@/components/UserMenu";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { THEMES } from "@/constants/themes";
import { getNotifications } from "@/app/actions/notifications";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";

interface HeaderProps {
    activeTheme: typeof THEMES.codex;
}

export function Header({ activeTheme }: HeaderProps) {
    const { status } = useSession();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const { setIsFinished, setIsActive, resetLiveState, mode, config, customTextLimitValue, customTextLimitMode } = useMonkeyTypeStore();

    const handleHomeClick = () => {
        const defaultTime = mode === "time"
            ? (config as number)
            : (mode === "custom" && customTextLimitMode === "time" && customTextLimitValue > 0 ? customTextLimitValue : 30);
        resetLiveState(defaultTime);
    };

    const checkUnread = async () => {
        const res = await getNotifications();
        const totalUnread = [...res.inbox, ...res.announcements, ...res.notifications].some(n => n.read === 0);
        setHasUnread(totalUnread);
    };

    useEffect(() => {
        checkUnread();
        
        // Refresh every 30 seconds for "real-time" feel
        const interval = setInterval(checkUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
        <header className="relative w-full flex items-center pt-8 pb-4 z-50 h-16 md:h-20" suppressHydrationWarning={true}>
                <div className="flex w-full max-w-[var(--content-max-w)] mx-auto items-center justify-between px-1 sm:px-4" suppressHydrationWarning={true}>
                    {/* Left Group: Logo + Navigation Icons */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full">
                        <Link href="/" onClick={handleHomeClick} className="flex items-center gap-1 sm:gap-2 group cursor-pointer pl-1 font-roboto">
                            <Type className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:scale-110" style={{ color: activeTheme.primary }} />
                            <h1 className="text-xl sm:text-2xl md:text-[32px] tracking-tight font-bold ml-0 relative" style={{ color: activeTheme.textDim }}>
                                <span style={{ color: activeTheme.text }}>type</span>flow
                            </h1>
                        </Link>

                        {/* Primary Navigation Icons (Monkeytype Style) */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Link href="/" onClick={handleHomeClick}>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/5 group cursor-pointer"
                                    title="Home"
                                    style={{ color: activeTheme.textDim }}
                                >
                                    <AuthenticKeyboard className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors group-hover:text-current hover:brightness-125" />
                                </motion.div>
                            </Link>

                            <Link href="/leaderboards">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/5 group cursor-pointer"
                                    title="Leaderboards"
                                    style={{ color: activeTheme.textDim }}
                                >
                                    <AuthenticCrown className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors group-hover:text-current hover:brightness-125" />
                                </motion.div>
                            </Link>

                            <Link href="/about">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/5 group cursor-pointer"
                                    title="About"
                                    style={{ color: activeTheme.textDim }}
                                >
                                    <AuthenticInfo className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors group-hover:text-current hover:brightness-125" />
                                </motion.div>
                            </Link>

                            <Link href="/settings">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/5 group cursor-pointer"
                                    title="Settings"
                                    style={{ color: activeTheme.textDim }}
                                >
                                    <AuthenticSettings className="w-4.5 h-4.5 sm:w-5 sm:h-5 group-hover:rotate-45 transition-transform group-hover:text-current hover:brightness-125" />
                                </motion.div>
                            </Link>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden sm:block flex-1" suppressHydrationWarning />

                    {/* Right Group: Notifications + Profile */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setIsNotificationsOpen(true);
                            }}
                            className="p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/5 group relative cursor-pointer"
                            type="button"
                            title="Notifications"
                            style={{ color: activeTheme.textDim }}
                        >
                            <AuthenticBell className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors group-hover:text-current hover:brightness-125" />
                            {hasUnread && (
                                <span 
                                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-black/20 animate-pulse" 
                                    style={{ backgroundColor: activeTheme.primary }}
                                />
                            )}
                        </motion.button>
                        
                        <UserMenu />
                    </div>
                </div>
                <NotificationsPanel 
                    isOpen={isNotificationsOpen} 
                    onClose={() => setIsNotificationsOpen(false)} 
                    onUpdate={checkUnread}
                    activeTheme={activeTheme} 
                />
            </header>
        </>
    );
}
