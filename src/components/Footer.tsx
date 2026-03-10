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
    const themeName = useMonkeyTypeStore((state) => state.theme);
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
        <footer className="w-full max-w-5xl mx-auto py-8 px-4 md:px-0 mt-auto transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Socials & Support */}
                <div className="flex items-center gap-6">
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
                                <link.icon className="w-4.5 h-4.5" />
                            </Link>
                        ))}
                    </div>

                    <div className="w-px h-3 bg-current opacity-30" style={{ color: activeTheme.textDim }} />

                    <Link
                        href="/support"
                        className="group flex items-center gap-1.5 transition-all duration-200 opacity-60 hover:opacity-100"
                        style={{ color: activeTheme.textDim }}
                    >
                        <Heart className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                        <span className="text-xs font-mono font-medium lowercase tracking-tight">
                            support
                        </span>
                    </Link>
                </div>

                {/* Legal & Version */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        {legalLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-xs font-mono font-medium lowercase tracking-tight opacity-60 hover:opacity-100 transition-all duration-200"
                                style={{ color: activeTheme.textDim }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="w-px h-3 bg-current opacity-30" style={{ color: activeTheme.textDim }} />

                    <Link
                        href="https://github.com/earhengleap/typing/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 group opacity-60 hover:opacity-100 transition-all duration-200"
                        style={{ color: activeTheme.textDim }}
                    >
                        <Code className="w-4.5 h-4.5" />
                        <span className="text-xs font-mono font-bold tracking-[0.1em] transition-all">
                            v0.1.0
                        </span>
                    </Link>
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
