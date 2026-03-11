"use client";

import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { motion } from "framer-motion";
import Link from "next/link";
import { Terminal, Trophy, Home } from "lucide-react";
import React from "react";

export default function NotFound() {
    const { theme } = useMonkeyTypeStore();
    const activeTheme = THEMES[theme as keyof typeof THEMES] || THEMES.codex;

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center p-6 font-mono transition-colors duration-500 overflow-hidden relative"
            style={{ backgroundColor: activeTheme.bg, color: activeTheme.textDim }}
        >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.05]">
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] rounded-full blur-[100px]"
                    style={{ backgroundColor: activeTheme.error || activeTheme.primary }}
                />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-2xl w-full flex flex-col items-center justify-center text-center gap-8 z-10"
            >
                {/* Visual Icon */}
                <motion.div
                    initial={{ scale: 0.8, rotate: -5 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatType: "reverse", 
                        ease: "easeInOut" 
                    }}
                    className="w-24 h-24 rounded-3xl flex items-center justify-center border-2 border-dashed shadow-2xl relative"
                    style={{ 
                        borderColor: `${activeTheme.error || activeTheme.primary}40`,
                        backgroundColor: `${activeTheme.error || activeTheme.primary}10`,
                        color: activeTheme.error || activeTheme.primary
                    }}
                >
                    <Terminal size={40} />
                    {/* Glitch Overlay */}
                    <div className="absolute inset-0 border-2 border-dashed opacity-50 rounded-3xl mix-blend-screen" 
                         style={{ 
                            borderColor: activeTheme.error || activeTheme.primary,
                            transform: "rotate(3deg) scale(1.05)"
                         }} 
                    />
                </motion.div>

                {/* Big 404 Header */}
                <div className="flex flex-col gap-2 relative">
                    <motion.h1 
                        className="text-8xl md:text-[9rem] font-black tracking-tighter leading-none"
                        style={{ color: activeTheme.text }}
                        initial={{ textShadow: "0px 0px 0px transparent" }}
                        animate={{ 
                            textShadow: [
                                `0px 0px 0px ${activeTheme.primary}00`,
                                `5px 0px 20px ${activeTheme.primary}50`,
                                `-5px 0px 20px ${activeTheme.primary}50`, 
                                `0px 0px 0px ${activeTheme.primary}00`
                            ],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        404
                    </motion.h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[120%] border-y-2 border-transparent mix-blend-overlay opacity-30 pointer-events-none z-20"
                         style={{ 
                            backgroundImage: `linear-gradient(transparent 50%, ${activeTheme.bgAlt} 50%)`,
                            backgroundSize: "100% 4px",
                         }}
                    />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-3 max-w-sm">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: activeTheme.text }}>
                        Signal Lost
                    </h2>
                    <p className="text-sm opacity-60 leading-relaxed">
                        The transmission you're looking for has drifted into the void. This route might be corrupted or never existed in the current workspace.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mt-4">
                    <Link href="/">
                        <button 
                            className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all hover:-translate-y-1 active:scale-95 group uppercase tracking-widest text-xs"
                            style={{ 
                                backgroundColor: activeTheme.primary,
                                color: activeTheme.bg,
                                boxShadow: `0 10px 30px -10px ${activeTheme.primary}80`
                            }}
                        >
                            <Home size={16} />
                            Start Typing
                        </button>
                    </Link>
                    
                    <Link href="/leaderboards">
                        <button 
                            className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all hover:bg-white/5 active:scale-95 group uppercase tracking-widest text-xs border border-transparent hover:border-white/10"
                        >
                            <Trophy size={16} className="opacity-60 group-hover:opacity-100" />
                            <span className="opacity-60 group-hover:opacity-100">Leaderboards</span>
                        </button>
                    </Link>
                </div>
            </motion.div>

            {/* Background Tech Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
                 style={{ 
                    backgroundImage: `linear-gradient(${activeTheme.text} 1px, transparent 1px), linear-gradient(90deg, ${activeTheme.text} 1px, transparent 1px)`,
                    backgroundSize: "50px 50px"
                 }}
            />
        </div>
    );
}
