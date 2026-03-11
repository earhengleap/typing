"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid admin credentials");
                setIsLoading(false);
            } else if (result?.ok) {
                toast.success("Authentication successful");
                // The layout protect route will naturally redirect non-admins home when they hit /admin/notifications
                router.push("/admin/notifications");
            }
        } catch {
            toast.error("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-[#ffaa00] blur-[100px] mix-blend-screen" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-12 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#ffaa00]/10 border border-[#ffaa00]/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,170,0,0.1)]">
                        <ShieldAlert className="w-8 h-8 text-[#ffaa00]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight mt-4">RESTRICTED AREA</h1>
                        <p className="text-xs tracking-[0.2em] font-bold text-[#ffaa00]/60 mt-1 uppercase">Admin Access Only</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] backdrop-blur-xl shadow-2xl">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Secure Email</label>
                        <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@typeflow.com"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#ffaa00] focus:border-[#ffaa00] transition-all text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 relative">
                        <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Access Protocol</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#ffaa00] focus:border-[#ffaa00] transition-all text-sm font-sans tracking-wide"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        className="w-full mt-4 py-4 rounded-xl font-black text-black bg-[#ffaa00] hover:bg-[#ffaa00]/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,170,0,0.2)]"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                INITIALIZE SESSION
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest opacity-30 font-bold hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3 h-3 rotate-180" />
                    <Link href="/">Return to Public Sector</Link>
                </div>
            </motion.div>
        </div>
    );
}
