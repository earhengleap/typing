"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { THEMES } from "@/constants/themes";
import { LogIn, LogOut, BarChart2 } from "lucide-react";
import { AuthenticSettings } from "@/components/icons/AuthenticSettings";
import { AuthenticUser } from "@/components/icons/AuthenticUser";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { useEffect, useState, useRef } from "react";
import { getUserTypingHistory } from "@/app/actions/typing-results";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function UserMenu() {
    const { data: session, status } = useSession();
    const theme = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[theme] || THEMES.codex;
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const userLevel = useMonkeyTypeStore((state) => state.userLevel);
    const setUserLevel = useMonkeyTypeStore((state) => state.setUserLevel);

    // Sync cloud history on login
    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            getUserTypingHistory(session.user.id).then((res) => {
                if (res.success && res.data) {
                    useMonkeyTypeStore.setState({ history: res.data });
                    if (res.user?.level) {
                        setUserLevel(res.user.level);
                    }
                }
            });
        }
    }, [status, session?.user?.id]);

    // Also sync level from session if available
    useEffect(() => {
        // @ts-ignore
        if (session?.user?.level && session.user.level !== userLevel) {
            // @ts-ignore
            setUserLevel(session.user.level);
        }
    }, [session?.user]);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 300); // Small delay to prevent accidental closing
    };

    if (status === "loading") {
        return <div className="w-8 h-8 rounded-full animate-pulse opacity-20" style={{ backgroundColor: activeTheme.text }} suppressHydrationWarning={true} />;
    }

    if (status === "unauthenticated") {
        return (
            <Link
                href="/login"
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 cursor-pointer hover:bg-white/5 active:scale-95 group"
                style={{ color: activeTheme.textDim }}
                title="Sign In"
            >
                <AuthenticUser className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors group-hover:text-current hover:brightness-125" />
            </Link>
        );
    }

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            suppressHydrationWarning={true}
        >
            <button
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                style={{ color: activeTheme.textDim }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = activeTheme.bgAlt;
                    e.currentTarget.style.color = activeTheme.text;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = activeTheme.textDim;
                }}
            >
                {session?.user?.image ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/10 transition-transform group-hover:border-white/20">
                        <Image src={session.user.image} alt="Avatar" fill className="object-cover" />
                    </div>
                ) : (
                    <div className="p-1 rounded-full" style={{ backgroundColor: activeTheme.bgAlt }}>
                        <AuthenticUser className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                )}
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-bold tracking-tight">{session?.user?.name}</span>
                    <span className="text-[10px] opacity-50 font-black tracking-widest uppercase" style={{ color: activeTheme.primary }}>
                        Lvl {userLevel}
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-2xl py-2 z-50 border overflow-hidden"
                        style={{
                            backgroundColor: activeTheme.bg,
                            borderColor: activeTheme.bgAlt,
                        }}
                        suppressHydrationWarning={true}
                    >

                        {/* Menu Items */}
                        <div className="py-1">
                            <Link
                                href="/account"
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors group"
                                style={{ color: activeTheme.textDim }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = activeTheme.bgAlt;
                                    e.currentTarget.style.color = activeTheme.text;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = activeTheme.textDim;
                                }}
                            >
                                <BarChart2 size={18} className="group-hover:opacity-100" />
                                <span className="font-medium">User Stats</span>
                            </Link>

                            <Link
                                href="/account-settings"
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors group"
                                style={{ color: activeTheme.textDim }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = activeTheme.bgAlt;
                                    e.currentTarget.style.color = activeTheme.text;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = activeTheme.textDim;
                                }}
                            >
                                <AuthenticSettings size={18} className="group-hover:opacity-100" />
                                <span className="font-medium">Account Settings</span>
                            </Link>
                            
                            <div className="h-px my-1" style={{ backgroundColor: activeTheme.bgAlt }} />

                            <button
                                onClick={() => {
                                    useMonkeyTypeStore.setState({ history: [] }); // Clear local history on logout
                                    signOut();
                                }}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-all duration-200 cursor-pointer group"
                                style={{ color: activeTheme.error }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = activeTheme.bgAlt;
                                    e.currentTarget.style.color = activeTheme.error;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                <LogOut size={16} className="opacity-70 group-hover:opacity-100" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
