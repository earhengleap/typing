"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { usePathname } from "next/navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;
    const pathname = usePathname();

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
            <Header activeTheme={activeTheme} />
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar" suppressHydrationWarning={true}>
                {children}
            </div>
            {!isAuthPage && <Footer />}
        </div>
    );
}
