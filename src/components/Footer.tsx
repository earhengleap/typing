"use client";

import React from "react";
import {
    Mail,
    Github,
    Twitter,
    MessageSquare,
    Heart,
    Code
} from "lucide-react";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Footer() {
    const { theme: themeName, setIsSearchOpen } = useMonkeyTypeStore();
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const socialLinks = [
        { label: "contact", href: "mailto:support@typeflow.com", icon: Mail },
        { label: "github", href: "https://github.com/earhengleap/typing", icon: Github },
        { label: "discord", href: "https://discord.gg/typeflow", icon: MessageSquare },
        { label: "twitter", href: "https://twitter.com/typeflow", icon: Twitter },
    ];

    const legalLinks = [
        { label: "terms", href: "/terms" },
        { label: "security", href: "/security" },
        { label: "privacy", href: "/privacy" },
    ];

    return (
        <footer className="w-full max-w-5xl mx-auto py-6 md:py-8 px-4 md:px-0 mt-auto transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                {/* Socials & Support */}
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-4">
                        {socialLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group transition-all duration-200 opacity-60 hover:opacity-100"
                                style={{ color: activeTheme.textDim }}
                                title={link.label}
                            >
                                <link.icon className="w-4 h-4 md:w-4.5 md:h-4.5" />
                            </Link>
                        ))}
                    </div>

                    <div className="hidden sm:block w-px h-3 bg-current opacity-30" style={{ color: activeTheme.textDim }} />

                    <Link
                        href="/support"
                        className="group flex items-center gap-1.5 transition-all duration-200 opacity-60 hover:opacity-100"
                        style={{ color: activeTheme.textDim }}
                    >
                        <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:text-red-500 transition-colors" />
                        <span className="text-[10px] md:text-xs font-mono font-medium lowercase tracking-tight">
                            support
                        </span>
                    </Link>
                </div>

                {/* Legal & Version */}
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-4">
                        {legalLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-[10px] md:text-xs font-mono font-medium lowercase tracking-tight opacity-60 hover:opacity-100 transition-all duration-200"
                                style={{ color: activeTheme.textDim }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden sm:block w-px h-3 bg-current opacity-30" style={{ color: activeTheme.textDim }} />

                    <div
                        role="button"
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-2 md:gap-2.5 group px-2 py-1 md:px-3 md:py-1.5 rounded-full transition-all duration-300 border border-transparent hover:border-current relative overflow-hidden cursor-pointer"
                        style={{
                            color: activeTheme.textDim,
                            backgroundColor: `${activeTheme.bgAlt}50`
                        }}
                    >
                        <div className="flex items-center gap-1.5 relative z-10">
                            <span className="relative flex h-1 w-1 md:h-1.5 md:w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeTheme.primary }}></span>
                                <span className="relative inline-flex rounded-full h-1 w-1 md:h-1.5 md:w-1.5" style={{ backgroundColor: activeTheme.primary }}></span>
                            </span>
                            <span className="text-[8px] md:text-[10px] font-mono font-black uppercase tracking-[0.1em] md:tracking-[0.15em] transition-all group-hover:text-current">
                                v1.0.0
                            </span>
                        </div>
                        <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" />
                    </div>
                </div>
            </div>



            <style jsx>{`
                footer :global(a:hover) {
                    color: ${activeTheme.text} !important;
                }
            `}</style>
        </footer>
    );
}
