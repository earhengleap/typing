"use client";

import { signIn } from "next-auth/react";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { UserPlus, LogIn, Github, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
    const { theme } = useMonkeyTypeStore();
    const activeTheme = THEMES[theme as keyof typeof THEMES] || THEMES.codex;

    const [showPassword, setShowPassword] = useState(false);

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 }
    };

    const inputStyle = {
        backgroundColor: activeTheme.bgAlt,
        color: activeTheme.text,
        borderColor: "transparent",
    };

    const buttonStyle = {
        backgroundColor: activeTheme.bgAlt,
        color: activeTheme.text,
    };

    return (
        <div
            className="min-h-screen flex flex-col font-mono transition-colors duration-500 overflow-x-hidden relative"
            style={{ backgroundColor: activeTheme.bg, color: activeTheme.textDim }}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[120px]"
                    style={{ backgroundColor: activeTheme.primary }}
                ></div>
            </div>

            {/* Top Navigation */}
            <header className="p-8 z-20">
                <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80 cursor-pointer w-fit">
                    <ArrowLeft size={18} style={{ color: activeTheme.primary }} />
                    <span className="text-xl font-bold tracking-tighter" style={{ color: activeTheme.text }}>
                        typeflow<span style={{ color: activeTheme.primary }}>.</span>
                    </span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 md:p-12 z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-start"
                >
                    {/* Register Column */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-8">
                        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight" style={{ color: activeTheme.text }}>
                            <UserPlus size={28} style={{ color: activeTheme.primary }} />
                            register
                        </div>

                        <div className="flex flex-col gap-4">
                            <motion.input
                                variants={itemVariants}
                                type="text"
                                placeholder="username"
                                className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                            />
                            <motion.input
                                variants={itemVariants}
                                type="email"
                                placeholder="email"
                                className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                            />
                            <motion.input
                                variants={itemVariants}
                                type="email"
                                placeholder="verify email"
                                className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                            />
                            <motion.div variants={itemVariants} className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="password"
                                    className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                    style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                                />
                            </motion.div>
                            <motion.input
                                variants={itemVariants}
                                type={showPassword ? "text" : "password"}
                                placeholder="verify password"
                                className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                            />

                            <motion.button
                                variants={itemVariants}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] mt-4 shadow-lg cursor-pointer"
                                style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                            >
                                <UserPlus size={20} />
                                sign up
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Login Column */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-8">
                        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight" style={{ color: activeTheme.text }}>
                            <LogIn size={28} style={{ color: activeTheme.primary }} />
                            login
                        </div>

                        {/* Social Logins */}
                        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => signIn("google", { callbackUrl: "/" })}
                                className="flex items-center justify-center gap-3 py-4 rounded-xl transition-all hover:opacity-80 active:scale-[0.98] border border-transparent hover:border-current cursor-pointer shadow-sm"
                                style={buttonStyle}
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale group-hover:grayscale-0" />
                                <span className="text-sm font-bold">Google</span>
                            </button>
                            <button
                                onClick={() => signIn("github", { callbackUrl: "/" })}
                                className="flex items-center justify-center gap-3 py-4 rounded-xl transition-all hover:opacity-80 active:scale-[0.98] border border-transparent hover:border-current cursor-pointer shadow-sm relative group"
                                style={buttonStyle}
                            >
                                <Github size={20} className="opacity-60 group-hover:opacity-100" />
                                <span className="text-sm font-bold">GitHub</span>
                            </button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center gap-4 py-2">
                            <div className="flex-1 h-px opacity-10" style={{ backgroundColor: activeTheme.textDim }}></div>
                            <span className="text-[10px] uppercase tracking-widest opacity-30">or continue with mail</span>
                            <div className="flex-1 h-px opacity-10" style={{ backgroundColor: activeTheme.textDim }}></div>
                        </motion.div>

                        {/* Email Login Form */}
                        <div className="flex flex-col gap-4">
                            <motion.input
                                variants={itemVariants}
                                type="email"
                                placeholder="email"
                                className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                            />
                            <motion.div variants={itemVariants} className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="password"
                                    className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                    style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex items-center justify-between text-xs px-1">
                                <label className="flex items-center gap-2 cursor-pointer group select-none">
                                    <input type="checkbox" className="hidden" />
                                    <div
                                        className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                                        style={{ borderColor: activeTheme.textDim }}
                                    >
                                        <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: activeTheme.primary }}></div>
                                    </div>
                                    remember me
                                </label>
                                <button className="hover:underline opacity-60 hover:opacity-100 transition-opacity cursor-pointer" style={{ color: activeTheme.primary }}>forgot password?</button>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] mt-4 shadow-lg cursor-pointer"
                                style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                            >
                                <LogIn size={20} />
                                sign in
                            </motion.button>
                        </div>
                    </motion.div>

                </motion.div>
            </main>

            <footer className="p-12 text-center text-[10px] tracking-widest uppercase opacity-20 flex flex-col gap-4 z-10">
                <div className="flex justify-center gap-8">
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">about</button>
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">contact</button>
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">terms</button>
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">privacy</button>
                </div>
                <div>typeflow &copy; 2026</div>
            </footer>
        </div>
    );
}
