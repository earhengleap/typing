"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const zenMode = useMonkeyTypeStore((state) => state.zenMode);
    const isActive = useMonkeyTypeStore((state) => state.isActive);
    const isFinished = useMonkeyTypeStore((state) => state.isFinished);
    const activeTheme = THEMES[themeName] || THEMES.codex;
    const pathname = usePathname();

    const isZenHidden = zenMode && isActive && !isFinished;


    // Check if current route is an admin route or auth page
    const isAdminRoute = pathname.startsWith("/admin");
    const isAuthPage = pathname === "/login" || pathname === "/reset-password";

    // If it's an admin route, we don't want the main header/footer
    if (isAdminRoute) {
        return <>{children}</>;
    }

    return (
        <div 
            className="h-screen h-[100dvh] flex flex-col transition-colors duration-500 overflow-hidden"
            style={{ backgroundColor: activeTheme.bg }}
            suppressHydrationWarning={true}
        >
            <AnimatePresence>
                {!isZenHidden && (
                    <motion.div
                        key="header-animation"
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.13, ease: "easeInOut" }}
                        className="shrink-0"
                    >
                        <Header activeTheme={activeTheme} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar" suppressHydrationWarning={true}>
                {children}
            </div>

            <AnimatePresence>
                {!isZenHidden && !isAuthPage && (
                    <motion.div
                        key="footer-animation"
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.13, ease: "easeInOut" }}
                        className="shrink-0"
                    >
                        <Footer />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
