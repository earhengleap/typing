"use client";

import React from "react";
import { motion } from "framer-motion";
import { Type, Crown, Settings, Keyboard as KeyboardIcon, Info, Bell } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { THEMES } from "@/constants/themes";
import { getNotifications } from "@/app/actions/notifications";

interface HeaderProps {
    activeTheme: typeof THEMES.codex;
}

export function Header({ activeTheme }: HeaderProps) {
    const { status } = useSession();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

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
        <header className="relative w-full flex items-center pt-4 pb-2 z-50 px-4 md:px-[180px] mb-4 h-16 md:h-20">
                <div className="flex w-full items-center justify-between">
                    {/* Left Group: Logo + Navigation Icons */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full">
                        <Link href="/" className="flex items-center gap-1 sm:gap-2 group cursor-pointer pl-1">
                            <Type className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:scale-110" style={{ color: activeTheme.primary }} />
                            <h1 className="text-xl sm:text-2xl md:text-[32px] tracking-tight font-bold ml-0 relative" style={{ color: activeTheme.textDim }}>
                                <span style={{ color: activeTheme.text }}>type</span>flow
                            </h1>
                        </Link>

                        {/* Primary Navigation Icons (Monkeytype Style) */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Link href="/">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/5 group cursor-pointer"
                                    type="button"
                                    title="Home"
                                    style={{ color: activeTheme.textDim }}
                                >
                                    <KeyboardIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-colors group-hover:text-current hover:brightness-125" />
                                </motion.button>
                            </Link>

                            <Link href="/leaderboards">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/5 group cursor-pointer"
                                    type="button"
                                    title="Leaderboards"
                                    style={{ color: activeTheme.textDim }}
                                >
                                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 transition-colors group-hover:text-current hover:brightness-125" />
                                </motion.button>
                            </Link>

                            <Link href="/about">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/5 group cursor-pointer"
                                    type="button"
                                    title="About"
                                    style={{ color: activeTheme.textDim }}
                                >
                                    <Info className="w-5 h-5 sm:w-6 sm:h-6 transition-colors group-hover:text-current hover:brightness-125" />
                                </motion.button>
                            </Link>

                            <Link href="/settings">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/5 group cursor-pointer"
                                    type="button"
                                    title="Settings"
                                    style={{ color: activeTheme.textDim }}
                                >
                                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-45 transition-transform group-hover:text-current hover:brightness-125" />
                                </motion.button>
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
                                if (status === "unauthenticated") {
                                    signIn();
                                } else {
                                    setIsNotificationsOpen(true);
                                }
                            }}
                            className="p-1.5 sm:p-2 rounded-xl transition-all hover:bg-white/5 group relative cursor-pointer"
                            type="button"
                            title="Notifications"
                            style={{ color: activeTheme.textDim }}
                        >
                            <Bell className="w-5 h-5 sm:w-6 sm:h-6 transition-colors group-hover:text-current hover:brightness-125" />
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
