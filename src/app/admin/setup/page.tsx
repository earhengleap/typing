"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Key, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { verifyAdminPassword } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminSetupPage() {
    const { update } = useSession();
    const router = useRouter();
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");
        
        const res = await verifyAdminPassword(password);
        
        if (res.success) {
            setStatus("success");
            // Force a session update to pick up the new role
            await update();
            setTimeout(() => {
                router.push("/admin/notifications");
            }, 2000);
        } else {
            setStatus("error");
            setError(res.error || "Verification failed");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col font-mono" style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}>
            <Header activeTheme={activeTheme} />

            <main className="flex-1 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md p-8 md:p-12 rounded-[2rem] border border-dashed flex flex-col items-center gap-8 text-center"
                    style={{ borderColor: `${activeTheme.textDim}20`, backgroundColor: `${activeTheme.bgAlt}30` }}
                >
                    {/* Icon Header */}
                    <div className="relative">
                        <motion.div 
                            animate={status === "success" ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                            className="w-20 h-20 rounded-3xl flex items-center justify-center bg-black/5"
                            style={{ color: status === "success" ? activeTheme.primary : status === "error" ? activeTheme.error : activeTheme.textDim }}
                        >
                            {status === "success" ? <ShieldCheck className="w-10 h-10" /> : <Key className="w-10 h-10 opacity-30" />}
                        </motion.div>
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: activeTheme.primary }} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-black tracking-tight">Secret Entrance</h1>
                        <p className="text-xs opacity-40 uppercase tracking-[0.2em] font-bold">Admin Shadow Key</p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                        <div className="relative group">
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Master Key..."
                                className="w-full bg-black/10 rounded-2xl py-4 px-6 text-center text-lg focus:outline-none focus:ring-1 transition-all placeholder:opacity-20"
                                style={{ color: activeTheme.text, border: `1px solid ${activeTheme.textDim}15` }}
                                disabled={loading || status === "success"}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {status === "error" && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center justify-center gap-2 text-xs font-bold"
                                    style={{ color: activeTheme.error }}
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            {status === "success" && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center justify-center gap-2 text-xs font-bold"
                                    style={{ color: activeTheme.primary }}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Access Granted. Redirecting...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading || !password || status === "success"}
                            className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-20 group"
                            style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Activate Privileges</span>}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <p className="text-[10px] opacity-20 max-w-[200px] leading-relaxed">
                        Authorized personnel only. All access attempts are recorded on the shadow ledger.
                    </p>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
