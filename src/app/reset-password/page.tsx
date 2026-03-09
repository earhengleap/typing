"use client";

import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/app/actions/auth";
import { Suspense } from "react";

function ResetPasswordContent() {
    const { theme } = useMonkeyTypeStore();
    const activeTheme = THEMES[theme as keyof typeof THEMES] || THEMES.codex;
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(!token ? "Invalid or missing reset token." : null);
    const [success, setSuccess] = useState<string | null>(null);

    const [passwordData, setPasswordData] = useState({
        password: "",
        verifyPassword: ""
    });


    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setError(null);
        setSuccess(null);
        setIsLoading(true);

        const formData = new FormData();
        formData.append("password", passwordData.password);
        formData.append("verifyPassword", passwordData.verifyPassword);

        const result = await resetPassword(token, formData);
        setIsLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(result.success || "Password reset successful!");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const inputStyle = {
        backgroundColor: activeTheme.bgAlt,
        color: activeTheme.text,
        borderColor: "transparent",
    };

    return (
        <main className="flex-1 flex items-center justify-center p-6 z-10">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md flex flex-col gap-8"
            >
                <div className="flex items-center gap-3 text-2xl font-bold tracking-tight" style={{ color: activeTheme.text }}>
                    <KeyRound size={28} style={{ color: activeTheme.primary }} />
                    reset password
                </div>

                {error && (
                    <div className="text-red-400 text-xs text-center font-bold px-4 py-3 rounded-lg bg-red-400/10">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="text-green-400 text-xs text-center font-bold px-4 py-3 rounded-lg bg-green-400/10">
                        {success}
                    </div>
                )}

                {!success && token && (
                    <form onSubmit={handleReset} className="flex flex-col gap-4">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="new password"
                                required
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as React.CSSProperties}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="verify password"
                            required
                            value={passwordData.verifyPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, verifyPassword: e.target.value })}
                            className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                            style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as React.CSSProperties}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] mt-4 shadow-lg cursor-pointer disabled:opacity-50"
                            style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                        >
                            <KeyRound size={20} />
                            {isLoading ? "resetting..." : "reset password"}
                        </button>
                    </form>
                )}

                {!token && !error && (
                    <div className="text-center opacity-40 text-sm">
                        Please use the link sent to your email.
                    </div>
                )}
            </motion.div>
        </main>
    );
}

export default function ResetPasswordPage() {
    const { theme } = useMonkeyTypeStore();
    const activeTheme = THEMES[theme as keyof typeof THEMES] || THEMES.codex;

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

            <Suspense fallback={
                <main className="flex-1 flex items-center justify-center p-6 z-10">
                    <div className="animate-pulse opacity-20 text-sm">loading reset session...</div>
                </main>
            }>
                <ResetPasswordContent />
            </Suspense>

            <footer className="p-12 text-center text-[10px] tracking-widest uppercase opacity-20 flex flex-col gap-4 z-10">
                <div className="flex justify-center gap-8">
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">about</button>
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">contact</button>
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">terms</button>
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">privacy</button>
                </div>
                <Link href="/" className="hover:opacity-100 transition-opacity cursor-pointer">typeflow &copy; 2026</Link>
            </footer>
        </div>
    );
}
