"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { THEMES } from "@/constants/themes";
import { LogIn, LogOut, User } from "lucide-react";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { useEffect, useState } from "react";
import { getUserTypingHistory } from "@/app/actions/typing-results";

export function UserMenu() {
    const { data: session, status } = useSession();
    const theme = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[theme] || THEMES.codex;
    const [isOpen, setIsOpen] = useState(false);

    // Sync cloud history on login
    useEffect(() => {
        if (status === "authenticated") {
            getUserTypingHistory().then((res) => {
                if (res.success && res.data) {
                    useMonkeyTypeStore.setState({ history: res.data });
                }
            });
        }
    }, [status]);

    if (status === "loading") {
        return <div className="w-8 h-8 rounded-full animate-pulse opacity-20" style={{ backgroundColor: activeTheme.text }} />;
    }

    if (status === "unauthenticated") {
        return (
            <button
                onClick={() => signIn()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                style={{ color: activeTheme.textDim }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = activeTheme.text;
                    e.currentTarget.style.backgroundColor = activeTheme.bgAlt;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = activeTheme.textDim;
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
            >
                <LogIn size={16} />
                Sign In
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                style={{ color: activeTheme.textDim }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = activeTheme.bgAlt)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
                {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full" />
                ) : (
                    <User size={20} />
                )}
                <span className="text-sm font-bold hidden sm:block">{session?.user?.name?.split(" ")[0]}</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div
                        className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl py-1 z-50 border"
                        style={{
                            backgroundColor: activeTheme.bg,
                            borderColor: activeTheme.bgAlt,
                        }}
                    >
                        <div className="px-4 py-2 border-b" style={{ borderColor: activeTheme.bgAlt, color: activeTheme.textDim }}>
                            <p className="text-xs truncate">{session?.user?.email}</p>
                        </div>
                        <button
                            onClick={() => {
                                useMonkeyTypeStore.setState({ history: [] }); // Clear local history on logout
                                signOut();
                            }}
                            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer"
                            style={{ color: activeTheme.error, opacity: 0.8 }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = activeTheme.bgAlt)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
