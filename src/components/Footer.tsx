"use client";

import React from "react";
import {
    Mail,
    Shield,
    FileText,
    Github,
    Twitter,
    MessageSquare,
    Heart,
    Lock,
    Terminal
} from "lucide-react";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import Link from "next/link";

export function Footer() {
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const footerLinks = [
        { label: "contact", href: "mailto:support@typeflow.com", icon: Mail },
        { label: "support", href: "/support", icon: Heart },
        { label: "github", href: "https://github.com/earhengleap/typing", icon: Github },
        { label: "discord", href: "https://discord.gg/typeflow", icon: MessageSquare },
        { label: "twitter", href: "https://twitter.com/typeflow", icon: Twitter },
        { label: "terms", href: "/terms", icon: FileText },
        { label: "security", href: "/security", icon: Shield },
        { label: "privacy", href: "/privacy", icon: Lock },
    ];

    return (
        <footer className="w-full max-w-5xl mx-auto py-12 px-4 md:px-0 mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3">
                    {footerLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            target={link.href.startsWith("http") ? "_blank" : undefined}
                            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="group flex items-center gap-2 transition-all duration-200"
                            style={{ color: activeTheme.textDim }}
                        >
                            <link.icon className="w-4 h-4 transition-colors group-hover:text-[var(--mt-primary)]" style={{ color: "inherit" }} />
                            <span className="text-xs font-mono font-medium tracking-tight transition-colors group-hover:text-[activeTheme.text]">
                                {link.label}
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        href="https://github.com/earhengleap/typing/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 group cursor-pointer transition-all duration-200"
                        style={{ color: activeTheme.textDim }}
                    >
                        <Terminal className="w-4 h-4 transition-colors group-hover:text-[var(--mt-primary)]" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-all">
                            v0.1.0
                        </span>
                    </Link>
                </div>
            </div>

            <style jsx>{`
                footer :global(a:hover) {
                    color: ${activeTheme.text} !important;
                }
                :root {
                    --mt-primary: ${activeTheme.primary};
                }
            `}</style>
        </footer>
    );
}
